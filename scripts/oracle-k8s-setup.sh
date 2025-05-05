#!/bin/bash
# Script para automatizar toda la configuración en Oracle VMs

# Variables de configuración
MASTER_IP="<IP-DEL-MASTER>"
WORKER_IP="<IP-DEL-WORKER>"
SSH_KEY_PATH="<PATH-A-TU-CLAVE-SSH>"
SSH_USER="ubuntu"

# Comprobar que tenemos la clave SSH
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "Error: Clave SSH no encontrada en $SSH_KEY_PATH"
    exit 1
fi

# Preparar máquina master
echo "Configurando nodo master..."
scp -i $SSH_KEY_PATH scripts/setup-k8s.sh $SSH_USER@$MASTER_IP:/tmp/
scp -i $SSH_KEY_PATH scripts/init-master.sh $SSH_USER@$MASTER_IP:/tmp/
ssh -i $SSH_KEY_PATH $SSH_USER@$MASTER_IP "sudo bash /tmp/setup-k8s.sh && sudo bash /tmp/init-master.sh"

# Obtener comando join
echo "Obteniendo comando para unir workers..."
JOIN_COMMAND=$(ssh -i $SSH_KEY_PATH $SSH_USER@$MASTER_IP "cat /root/join-command.sh")

# Preparar máquina worker
echo "Configurando nodo worker..."
scp -i $SSH_KEY_PATH scripts/setup-k8s.sh $SSH_USER@$WORKER_IP:/tmp/
ssh -i $SSH_KEY_PATH $SSH_USER@$WORKER_IP "sudo bash /tmp/setup-k8s.sh && sudo $JOIN_COMMAND"

# Copiar archivos de configuración de Kubernetes al nodo master
echo "Copiando archivos de configuración..."
ssh -i $SSH_KEY_PATH $SSH_USER@$MASTER_IP "mkdir -p ~/wichat_k8s"
scp -i $SSH_KEY_PATH -r k8s/* $SSH_USER@$MASTER_IP:~/wichat_k8s/

# Modificar los archivos YAML para usar imágenes desde un registro
echo "Modificando archivos YAML para usar imágenes de registro..."
ssh -i $SSH_KEY_PATH $SSH_USER@$MASTER_IP "
    cd ~/wichat_k8s
    sed -i 's|image: wichat-mathgame:latest|image: ghcr.io/USUARIO/wichat-mathgame:latest|g' mathgame.yaml
    sed -i 's|imagePullPolicy: Never|imagePullPolicy: Always|g' mathgame.yaml
    # Modificar otros archivos YAML según sea necesario
"

# Aplicar configuraciones
echo "Aplicando configuraciones Kubernetes..."
ssh -i $SSH_KEY_PATH $SSH_USER@$MASTER_IP "
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
scp -i $SSH_KEY_PATH scripts/setup-port-forwards.sh $SSH_USER@$MASTER_IP:/tmp/
ssh -i $SSH_KEY_PATH $SSH_USER@$MASTER_IP "bash /tmp/setup-port-forwards.sh"

# Configurar crontab para reiniciar los port-forwards después de reiniciar
echo "Configurando crontab para port-forwards persistentes..."
ssh -i $SSH_KEY_PATH $SSH_USER@$MASTER_IP "
    echo '@reboot bash /tmp/setup-port-forwards.sh' > /tmp/crontab_new
    crontab /tmp/crontab_new
"

echo "Configuración completada. Comprobando estado del clúster..."
ssh -i $SSH_KEY_PATH $SSH_USER@$MASTER_IP "kubectl get nodes && kubectl get pods -n wichat-es2a"
