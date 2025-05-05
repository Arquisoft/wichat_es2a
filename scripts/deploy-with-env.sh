#!/bin/bash
# Script para desplegar en Oracle usando variables de entorno

# Usar variables existentes o sus alternativas
MASTER_IP=${DEPLOY_HOST:-$MASTER_IP}
SSH_USER=${DEPLOY_USER:-$SSH_USER}
SSH_KEY=${DEPLOY_KEY:-$SSH_KEY}

# Verificar que al menos tenemos la IP del nodo master
if [ -z "$MASTER_IP" ]; then
    echo "Error: La variable DEPLOY_HOST o MASTER_IP debe estar definida"
    echo "Ejemplo: export DEPLOY_HOST=192.168.1.100"
    exit 1
fi

# Verificar que tenemos o una clave SSH o un path a una
if [ "$SSH_KEY" ]; then
    # Si se proporciona la clave SSH como texto, guardarla en un archivo temporal
    echo "$SSH_KEY" > /tmp/oracle_ssh_key
    chmod 600 /tmp/oracle_ssh_key
    SSH_KEY_PATH="/tmp/oracle_ssh_key"
    echo "Clave SSH configurada desde variable de entorno"
elif [ -z "$SSH_KEY_PATH" ]; then
    echo "Error: Se debe proporcionar DEPLOY_KEY/SSH_KEY (contenido de la clave) o SSH_KEY_PATH (ruta al archivo)"
    exit 1
fi

# Configurar valor por defecto para el usuario SSH
SSH_USER=${SSH_USER:-"ubuntu"}
echo "Usando usuario SSH: $SSH_USER"
echo "Nodo master: $MASTER_IP"

# Comprobar si tenemos nodo worker definido
if [ -n "$WORKER_IP" ]; then
    echo "Nodo worker: $WORKER_IP"
    SETUP_WORKER=true
    
    # Verificar si hay una clave SSH específica para el worker
    WORKER_SSH_KEY=${WORKER_DEPLOY_KEY:-$SSH_KEY}
    if [ "$WORKER_SSH_KEY" ] && [ "$WORKER_SSH_KEY" != "$SSH_KEY" ]; then
        # Si se proporciona una clave SSH específica para el worker, guardarla en un archivo temporal
        echo "$WORKER_SSH_KEY" > /tmp/oracle_worker_ssh_key
        chmod 600 /tmp/oracle_worker_ssh_key
        WORKER_SSH_KEY_PATH="/tmp/oracle_worker_ssh_key"
        echo "Clave SSH específica para worker configurada desde variable de entorno"
    else
        # Si no hay una clave específica para el worker, usar la misma del master
        WORKER_SSH_KEY_PATH=$SSH_KEY_PATH
        echo "Usando la misma clave SSH para worker que para master"
    fi
    
    # Usuario SSH para el worker (por defecto el mismo que para el master)
    WORKER_SSH_USER=${WORKER_DEPLOY_USER:-$SSH_USER}
    echo "Usuario SSH para worker: $WORKER_SSH_USER"
else
    echo "No se ha definido un nodo worker, configurando solo nodo master"
    SETUP_WORKER=false
fi

# Resto del script con las variables configuradas
# Preparar máquina master
echo "Configurando nodo master..."
scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no scripts/setup-k8s.sh $SSH_USER@$MASTER_IP:/tmp/
scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no scripts/init-master.sh $SSH_USER@$MASTER_IP:/tmp/
ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $SSH_USER@$MASTER_IP "sudo bash /tmp/setup-k8s.sh && sudo bash /tmp/init-master.sh"

# Configurar worker solo si tenemos definida la IP
if [ "$SETUP_WORKER" = true ]; then
    # Obtener comando join
    echo "Obteniendo comando para unir workers..."
    JOIN_COMMAND=$(ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $SSH_USER@$MASTER_IP "sudo cat /root/join-command.sh")

    # Preparar máquina worker
    echo "Configurando nodo worker..."
    scp -i $WORKER_SSH_KEY_PATH -o StrictHostKeyChecking=no scripts/setup-k8s.sh $WORKER_SSH_USER@$WORKER_IP:/tmp/
    ssh -i $WORKER_SSH_KEY_PATH -o StrictHostKeyChecking=no $WORKER_SSH_USER@$WORKER_IP "sudo bash /tmp/setup-k8s.sh && sudo $JOIN_COMMAND"
else
    echo "Saltando la configuración del nodo worker..."
fi

# Copiar archivos de configuración de Kubernetes al nodo master
echo "Copiando archivos de configuración..."
ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $SSH_USER@$MASTER_IP "mkdir -p ~/wichat_k8s"
scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no -r k8s/* $SSH_USER@$MASTER_IP:~/wichat_k8s/

# Modificar los archivos YAML para usar imágenes desde un registro
echo "Modificando archivos YAML para usar imágenes de registro..."
GITHUB_USER=${GITHUB_USER:-"TU-USUARIO-GITHUB"}
ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $SSH_USER@$MASTER_IP "
    cd ~/wichat_k8s
    sed -i 's|image: wichat-mathgame:latest|image: ghcr.io/$GITHUB_USER/wichat-mathgame:latest|g' mathgame.yaml
    sed -i 's|imagePullPolicy: Never|imagePullPolicy: Always|g' mathgame.yaml
    sed -i 's|image: wichat-userservice:latest|image: ghcr.io/$GITHUB_USER/wichat-userservice:latest|g' userservice.yaml
    sed -i 's|imagePullPolicy: Never|imagePullPolicy: Always|g' userservice.yaml
    # Modificar otros archivos YAML según sea necesario
"

# Aplicar configuraciones
echo "Aplicando configuraciones Kubernetes..."
ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $SSH_USER@$MASTER_IP "
    cd ~/wichat_k8s
    kubectl apply -f namespace.yaml
    kubectl apply -f secrets.yaml
    kubectl apply -f mongodb.yaml
    # Esperar a que MongoDB esté listo
    echo 'Esperando a que MongoDB esté listo...'
    kubectl wait --for=condition=Ready pod -l app=mongodb -n wichat-es2a --timeout=300s
    # Aplicar el resto de servicios
    kubectl apply -f mathgame.yaml
    kubectl apply -f userservice.yaml
    kubectl apply -f webapp.yaml
    # Añadir otros servicios
"

# Configurar port-forwards
echo "Configurando port-forwards..."
scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no scripts/setup-port-forwards.sh $SSH_USER@$MASTER_IP:/tmp/
ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $SSH_USER@$MASTER_IP "bash /tmp/setup-port-forwards.sh"

# Configurar crontab para reiniciar los port-forwards después de reiniciar
echo "Configurando crontab para port-forwards persistentes..."
ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $SSH_USER@$MASTER_IP "
    echo '@reboot bash /tmp/setup-port-forwards.sh' > /tmp/crontab_new
    crontab /tmp/crontab_new
"

echo "Configuración completada. Comprobando estado del clúster..."
ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $SSH_USER@$MASTER_IP "kubectl get nodes && kubectl get pods -n wichat-es2a"

# Limpiar archivos temporales
if [ "$SSH_KEY" ]; then
    echo "Eliminando archivo temporal de clave SSH para master"
    rm -f /tmp/oracle_ssh_key
fi

if [ "$WORKER_SSH_KEY" ] && [ "$WORKER_SSH_KEY" != "$SSH_KEY" ]; then
    echo "Eliminando archivo temporal de clave SSH para worker"
    rm -f /tmp/oracle_worker_ssh_key
fi
