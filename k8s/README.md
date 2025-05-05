# Despliegue en Kubernetes con Minikube

Este documento describe cómo desplegar la aplicación WiChat en Kubernetes utilizando Minikube.

## Requisitos previos

- [Minikube](https://minikube.sigs.k8s.io/docs/start/) instalado
- [kubectl](https://kubernetes.io/docs/tasks/tools/) instalado
- [Docker](https://www.docker.com/products/docker-desktop/) instalado
- Claves API para los servicios LLM (Gemini y Empathy)

## Estructura de archivos Kubernetes

Los archivos de configuración de Kubernetes se encuentran en la carpeta `k8s/`:

- `namespace.yaml`: Crea el espacio de nombres `wichat-es2a`
- `secrets.yaml`: Define los secretos para las claves API
- `mongodb.yaml`: Configuración para la base de datos MongoDB
- `authservice.yaml`: Servicio de autenticación
- `userservice.yaml`: Servicio de gestión de usuarios
- `groupservice.yaml`: Servicio de gestión de grupos
- `llm-mathgame.yaml`: Servicio LLM (Procesamiento de lenguaje natural)
- `mathgame.yaml`: Servicio de juegos matemáticos
- `wikidata.yaml`: Servicio de datos de Wikidata
- `api-gateway.yaml`: Servicio API Gateway
- `gatewayservice.yaml`: Servicio Gateway
- `webapp.yaml`: Aplicación web frontend
- `ingress.yaml`: Configuración de Ingress para acceso externo

## Despliegue

### Configuración de secrets

Antes de desplegar, necesitas configurar las claves API:

1. Edita el archivo `k8s/secrets.yaml` y reemplaza `YOUR_BASE64_GEMINI_KEY_HERE` y `YOUR_BASE64_EMPATHY_KEY_HERE` con tus claves API codificadas en base64.

   Para codificar en base64:
   - Windows PowerShell: `[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("tu-clave-api"))`
   - Linux/Mac: `echo -n "tu-clave-api" | base64`

### Despliegue automático

Para Windows, usa el script PowerShell:

```powershell
# Primero, edita el script para configurar tus claves API
.\deploy-minikube.ps1
```

Para Linux/Mac, usa el script bash:

```bash
# Primero, edita el script para configurar tus claves API
chmod +x deploy-minikube.sh
./deploy-minikube.sh
```

### Despliegue manual

Si prefieres hacerlo paso a paso:

1. Inicia Minikube:
   ```
   minikube start
   ```

2. Construye las imágenes Docker:
   ```
   docker-compose build
   ```

3. Carga las imágenes en Minikube:
   ```
   minikube image load ghcr.io/arquisoft/wichat_es2a/authservice:latest
   minikube image load ghcr.io/arquisoft/wichat_es2a/userservice:latest
   # ... (repetir para todas las imágenes)
   ```

4. Crea el namespace:
   ```
   kubectl apply -f k8s/namespace.yaml
   ```

5. Despliega los recursos en orden:
   ```
   kubectl apply -f k8s/secrets.yaml
   kubectl apply -f k8s/mongodb.yaml
   kubectl apply -f k8s/authservice.yaml
   # ... (aplicar todos los archivos yaml)
   ```

6. Habilita el addon Ingress:
   ```
   minikube addons enable ingress
   ```

7. Obtén la URL de acceso:
   ```
   minikube service webapp -n wichat-es2a --url
   ```

## Verificación del despliegue

Para verificar que todo está funcionando correctamente:

1. Comprueba que todos los pods estén en estado `Running`:
   ```
   kubectl get pods -n wichat-es2a
   ```

2. Comprueba los logs de cada servicio:
   ```
   kubectl logs -n wichat-es2a deployment/webapp
   ```

3. Accede a la aplicación web a través de la URL proporcionada por el comando `minikube service webapp -n wichat-es2a --url`

## Solución de problemas

### Pods en estado "ImagePullBackOff" o "ErrImagePull"

Asegúrate de que las imágenes se han construido correctamente y se han cargado en Minikube:
```
docker-compose build
minikube image load ghcr.io/arquisoft/wichat_es2a/webapp:latest
```

### Errores de conexión entre servicios

Verifica que los ConfigMaps tengan las URLs correctas y que los servicios estén expuestos correctamente:
```
kubectl get configmaps -n wichat-es2a
kubectl get services -n wichat-es2a
```

### Lentitud o fallos en las peticiones

Comprueba los logs de los servicios para identificar el problema:
```
kubectl logs -n wichat-es2a deployment/gatewayservice
```
