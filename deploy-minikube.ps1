# Script de PowerShell para desplegar la aplicación en Minikube

# Establecer las variables de entorno (reemplazar con tus propias claves API)
$GEMINI_API_KEY = "AIzaSyA_Bb3j9aa_XLWVRnMQKmU_0r8iovOaWuI"
$EMPATHY_API_KEY = "your_empathy_key_here"

Write-Host "===> Iniciando Minikube si no está activo..." -ForegroundColor Cyan
$minikubeStatus = minikube status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Iniciando Minikube..." -ForegroundColor Yellow
    minikube start
}

Write-Host "===> Construyendo imágenes Docker..." -ForegroundColor Cyan
# Construir todas las imágenes Docker
docker-compose build

Write-Host "===> Construyendo y cargando imágenes en Minikube..." -ForegroundColor Cyan

# Etiquetar las imágenes para ser usadas en Minikube
Write-Host "Etiquetando imágenes para Minikube..." -ForegroundColor Yellow
docker tag ghcr.io/arquisoft/wichat_es2a/authservice:latest wichat-authservice:latest
docker tag ghcr.io/arquisoft/wichat_es2a/userservice:latest wichat-userservice:latest
docker tag ghcr.io/arquisoft/wichat_es2a/llmservice:latest wichat-llmservice:latest
docker tag ghcr.io/arquisoft/wichat_es2a/gatewayservice:latest wichat-gatewayservice:latest
docker tag ghcr.io/arquisoft/wichat_es2a/webapp:latest wichat-webapp:latest
docker tag ghcr.io/arquisoft/wichat_es2a/wikidata:latest wichat-wikidata:latest
docker tag ghcr.io/arquisoft/wichat_es2a/mathgame:latest wichat-mathgame:latest
docker tag ghcr.io/arquisoft/wichat_es2a/apiservice:latest wichat-apiservice:latest
docker tag ghcr.io/arquisoft/wichat_es2a/groupservice:latest wichat-groupservice:latest

# Cargar imágenes en Minikube
Write-Host "Cargando imágenes en Minikube..." -ForegroundColor Yellow
minikube image load wichat-authservice:latest
minikube image load wichat-userservice:latest
minikube image load wichat-llmservice:latest
minikube image load wichat-gatewayservice:latest
minikube image load wichat-webapp:latest
minikube image load wichat-wikidata:latest
minikube image load wichat-mathgame:latest
minikube image load wichat-apiservice:latest
minikube image load wichat-groupservice:latest

Write-Host "===> Creando namespace..." -ForegroundColor Cyan
kubectl apply -f k8s/namespace.yaml

Write-Host "===> Codificando secrets en base64..." -ForegroundColor Cyan
# Codificar los secretos en base64
$GEMINI_API_KEY_B64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($GEMINI_API_KEY))
$EMPATHY_API_KEY_B64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($EMPATHY_API_KEY))

# Leer el contenido del archivo secrets.yaml
$secretsContent = Get-Content -Path k8s/secrets.yaml -Raw

# Reemplazar los placeholders
$secretsContent = $secretsContent -replace "YOUR_BASE64_GEMINI_KEY_HERE", $GEMINI_API_KEY_B64
$secretsContent = $secretsContent -replace "YOUR_BASE64_EMPATHY_KEY_HERE", $EMPATHY_API_KEY_B64

# Escribir el contenido actualizado al archivo
Set-Content -Path k8s/secrets.yaml -Value $secretsContent

Write-Host "===> Aplicando secretos..." -ForegroundColor Cyan
kubectl apply -f k8s/secrets.yaml

Write-Host "===> Desplegando MongoDB..." -ForegroundColor Cyan
kubectl apply -f k8s/mongodb.yaml

Write-Host "===> Desplegando servicios principales..." -ForegroundColor Cyan
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

Write-Host "===> Esperando a que todos los pods estén listos..." -ForegroundColor Cyan
kubectl wait --for=condition=ready pods --all -n wichat-es2a --timeout=180s

Write-Host "===> Habilitando Ingress si no está activo..." -ForegroundColor Cyan
minikube addons enable ingress

Write-Host "===> Aplicando configuración del balanceador de carga..." -ForegroundColor Cyan
# Aplicar la configuración del balanceador de carga
kubectl apply -f k8s/load-balancer-config.yaml

# Obtener la IP de Minikube
$minikubeIp = minikube ip
Write-Host "IP de Minikube: $minikubeIp" -ForegroundColor Cyan

# Añadir entrada en hosts para facilitar acceso
Write-Host "NOTA: Para acceder a la aplicación mediante wichat.local, añade esta entrada al archivo hosts:" -ForegroundColor Yellow
Write-Host "$minikubeIp wichat.local" -ForegroundColor White

Write-Host "===> Obteniendo URLs de acceso..." -ForegroundColor Cyan
minikube service webapp -n wichat-es2a --url
Write-Host "URL de acceso mediante Ingress: http://wichat.local" -ForegroundColor Green

Write-Host "===> Aplicación desplegada con éxito!" -ForegroundColor Green
Write-Host "Para habilitar el LoadBalancer externo, ejecuta 'minikube tunnel' en una terminal separada con privilegios de administrador."
Write-Host "Para verificar el estado del balanceador de carga, ejecuta '.\check-load-balancer.ps1'"
