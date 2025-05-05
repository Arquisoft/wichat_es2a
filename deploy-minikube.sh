#!/bin/bash

# Establecer las variables de entorno (reemplazar con tus propias claves API)
GEMINI_API_KEY="your_gemini_key_here"
EMPATHY_API_KEY="your_empathy_key_here"

echo "===> Iniciando Minikube si no está activo..."
minikube status || minikube start

echo "===> Construyendo imágenes Docker..."
# Construir todas las imágenes Docker
docker-compose build

echo "===> Cargando imágenes en Minikube..."
# Cargar imágenes en Minikube
minikube image load wichat-authservice:latest
minikube image load wichat-userservice:latest
minikube image load wichat-llmservice:latest
minikube image load wichat-gatewayservice:latest
minikube image load wichat-webapp:latest
minikube image load wichat-wikidata:latest
minikube image load wichat-mathgame:latest
minikube image load wichat-apiservice:latest
minikube image load wichat-groupservice:latest

echo "===> Creando namespace..."
kubectl apply -f k8s/namespace.yaml

echo "===> Codificando secrets en base64..."
# Codificar los secretos en base64
GEMINI_API_KEY_B64=$(echo -n "$GEMINI_API_KEY" | base64)
EMPATHY_API_KEY_B64=$(echo -n "$EMPATHY_API_KEY" | base64)

# Reemplazar los placeholders en secrets.yaml
sed -i "s/YOUR_BASE64_GEMINI_KEY_HERE/$GEMINI_API_KEY_B64/g" k8s/secrets.yaml
sed -i "s/YOUR_BASE64_EMPATHY_KEY_HERE/$EMPATHY_API_KEY_B64/g" k8s/secrets.yaml

echo "===> Aplicando secretos..."
kubectl apply -f k8s/secrets.yaml

echo "===> Desplegando MongoDB..."
kubectl apply -f k8s/mongodb.yaml

echo "===> Desplegando servicios principales..."
kubectl apply -f k8s/authservice.yaml
kubectl apply -f k8s/userservice.yaml
kubectl apply -f k8s/groupservice.yaml
kubectl apply -f k8s/llm-mathgame.yaml
kubectl apply -f k8s/mathgame.yaml
kubectl apply -f k8s/wikidata.yaml
kubectl apply -f k8s/api-gateway.yaml
kubectl apply -f k8s/gatewayservice.yaml
kubectl apply -f k8s/webapp.yaml
kubectl apply -f k8s/ingress.yaml

echo "===> Esperando a que todos los pods estén listos..."
kubectl wait --for=condition=ready pods --all -n wichat-es2a --timeout=180s

echo "===> Habilitando Ingress si no está activo..."
minikube addons enable ingress

echo "===> Obteniendo URL de acceso..."
minikube service webapp -n wichat-es2a --url

echo "===> Aplicación desplegada con éxito!"
echo "Puedes acceder a la aplicación usando la URL proporcionada arriba."
