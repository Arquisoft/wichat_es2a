#!/bin/bash
# Script para configurar nodos Kubernetes en Ubuntu

# Actualizar e instalar dependencias
apt-get update
apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Instalar Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

# Iniciar y habilitar Docker
systemctl start docker
systemctl enable docker

# Añadir usuario actual al grupo docker
usermod -aG docker $USER

# Deshabilitar el swap
swapoff -a
sed -i '/swap/d' /etc/fstab

# Configurar los módulos del kernel necesarios
cat <<EOF | tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF

cat <<EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sysctl --system

# Añadir repositorio de Kubernetes
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
cat <<EOF | tee /etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF
apt-get update

# Instalar Kubernetes
apt-get install -y kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl

echo "Instalación completada. Por favor reinicia el sistema."
