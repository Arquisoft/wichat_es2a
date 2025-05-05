#!/bin/bash
# Script para desplegar usando las variables DEPLOY_KEY, DEPLOY_HOST y DEPLOY_USER

# Verificar que las variables de entorno necesarias están definidas
if [ -z "$DEPLOY_HOST" ]; then
    echo "Error: DEPLOY_HOST no está definida. Establece esta variable antes de ejecutar el script."
    echo "Ejemplo: export DEPLOY_HOST=192.168.1.100"
    exit 1
fi

if [ -z "$DEPLOY_KEY" ]; then
    echo "Error: DEPLOY_KEY no está definida. Establece esta variable antes de ejecutar el script."
    echo "Ejemplo: export DEPLOY_KEY='-----BEGIN OPENSSH PRIVATE KEY-----...'"
    exit 1
fi

# Usar valores por defecto para DEPLOY_USER si no está definido
DEPLOY_USER=${DEPLOY_USER:-"ubuntu"}
echo "Usando DEPLOY_USER: $DEPLOY_USER"
echo "Usando DEPLOY_HOST: $DEPLOY_HOST"

# Guardar la clave SSH en un archivo temporal
echo "$DEPLOY_KEY" > /tmp/deploy_ssh_key
chmod 600 /tmp/deploy_ssh_key

# Verificar que podemos conectarnos al servidor
echo "Verificando conexión SSH..."
if ! ssh -i /tmp/deploy_ssh_key -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "echo 'Conexión exitosa'"; then
    echo "Error: No se pudo establecer conexión SSH con $DEPLOY_USER@$DEPLOY_HOST"
    rm -f /tmp/deploy_ssh_key
    exit 1
fi

echo "Conexión SSH exitosa. Comenzando despliegue..."

# Preparar máquina
echo "Configurando nodo Kubernetes..."
scp -i /tmp/deploy_ssh_key -o StrictHostKeyChecking=no scripts/setup-k8s.sh $DEPLOY_USER@$DEPLOY_HOST:/tmp/
scp -i /tmp/deploy_ssh_key -o StrictHostKeyChecking=no scripts/init-master.sh $DEPLOY_USER@$DEPLOY_HOST:/tmp/
ssh -i /tmp/deploy_ssh_key -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "sudo bash /tmp/setup-k8s.sh && sudo bash /tmp/init-master.sh"

# Copiar archivos de configuración de Kubernetes
echo "Copiando archivos de configuración..."
ssh -i /tmp/deploy_ssh_key -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "mkdir -p ~/wichat_k8s"
scp -i /tmp/deploy_ssh_key -o StrictHostKeyChecking=no -r k8s/* $DEPLOY_USER@$DEPLOY_HOST:~/wichat_k8s/

# Modificar los archivos YAML para usar imágenes desde un registro
echo "Modificando archivos YAML para usar imágenes de registro..."
GITHUB_USER=${GITHUB_USER:-$(git config user.name || echo "usuario")}
ssh -i /tmp/deploy_ssh_key -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
    cd ~/wichat_k8s
    sed -i 's|image: wichat-mathgame:latest|image: ghcr.io/$GITHUB_USER/wichat-mathgame:latest|g' mathgame.yaml
    sed -i 's|imagePullPolicy: Never|imagePullPolicy: Always|g' mathgame.yaml
    sed -i 's|image: wichat-userservice:latest|image: ghcr.io/$GITHUB_USER/wichat-userservice:latest|g' userservice.yaml
    sed -i 's|imagePullPolicy: Never|imagePullPolicy: Always|g' userservice.yaml
    # Modificar otros archivos YAML según sea necesario
"

# Aplicar configuraciones
echo "Aplicando configuraciones Kubernetes..."
ssh -i /tmp/deploy_ssh_key -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
    cd ~/wichat_k8s
    kubectl apply -f namespace.yaml
    kubectl apply -f secrets.yaml
    kubectl apply -f mongodb.yaml
    # Esperar a que MongoDB esté listo
    echo 'Esperando a que MongoDB esté listo...'
    kubectl wait --for=condition=Ready pod -l app=mongodb -n wichat-es2a --timeout=300s || true
    # Aplicar el resto de servicios
    kubectl apply -f mathgame.yaml
    kubectl apply -f userservice.yaml
    kubectl apply -f webapp.yaml
    # Añadir otros servicios según sea necesario
"

# Configurar port-forwards
echo "Configurando port-forwards..."
scp -i /tmp/deploy_ssh_key -o StrictHostKeyChecking=no scripts/setup-port-forwards.sh $DEPLOY_USER@$DEPLOY_HOST:/tmp/
ssh -i /tmp/deploy_ssh_key -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "bash /tmp/setup-port-forwards.sh"

# Configurar crontab para reiniciar los port-forwards después de reiniciar
echo "Configurando crontab para port-forwards persistentes..."
ssh -i /tmp/deploy_ssh_key -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
    echo '@reboot bash /tmp/setup-port-forwards.sh' > /tmp/crontab_new
    crontab /tmp/crontab_new
"

echo "Configuración completada. Comprobando estado del clúster..."
ssh -i /tmp/deploy_ssh_key -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "kubectl get nodes && kubectl get pods -n wichat-es2a"

# Limpiar archivos temporales
echo "Eliminando archivo temporal de clave SSH"
rm -f /tmp/deploy_ssh_key

echo "Despliegue completado exitosamente"
