#!/bin/bash
# Script para configurar port-forwards persistentes

# Matar cualquier proceso de port-forward existente
pkill -f "kubectl port-forward"

# Configurar port-forwards
nohup kubectl port-forward -n wichat-es2a service/gatewayservice 8000:8000 --address=0.0.0.0 > /tmp/gateway.log 2>&1 &
nohup kubectl port-forward -n wichat-es2a service/mathgame 3002:3002 --address=0.0.0.0 > /tmp/mathgame.log 2>&1 &
nohup kubectl port-forward -n wichat-es2a service/webapp 3000:3000 --address=0.0.0.0 > /tmp/webapp.log 2>&1 &
# Añadir más port-forwards según sea necesario

echo "Port-forwards configurados:"
ps aux | grep "kubectl port-forward" | grep -v grep
