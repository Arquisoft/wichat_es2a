#!/bin/bash
# Script para inicializar el nodo maestro

# Inicializar el clúster Kubernetes (asegúrate de reemplazar <IP-DEL-MASTER> con tu IP real)
kubeadm init --pod-network-cidr=10.244.0.0/16 --apiserver-advertise-address=<IP-DEL-MASTER>

# Configurar kubectl para el usuario actual
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config

# Instalar la red de Flannel para comunicación entre pods
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml

# Generar token para unir nodos al clúster
kubeadm token create --print-join-command > /root/join-command.sh
chmod +x /root/join-command.sh

echo "El clúster está inicializado. Usa el comando de join generado en /root/join-command.sh para añadir nodos workers."
