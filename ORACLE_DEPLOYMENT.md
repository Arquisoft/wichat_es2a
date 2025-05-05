# Despliegue de WiChat en Oracle Cloud con Kubernetes

Este documento describe cómo desplegar la aplicación WiChat en un clúster de Kubernetes distribuido en dos máquinas virtuales de Oracle Cloud.

## Requisitos previos

- Dos máquinas virtuales en Oracle Cloud con Ubuntu instalado
- Acceso SSH a ambas máquinas
- Permisos de sudo en ambas máquinas
- GitHub Actions configurado en el repositorio (para despliegue automático)

## Configuración manual

### 1. Preparación de las máquinas

En ambas máquinas, ejecuta el siguiente comando para instalar las dependencias necesarias:

```bash
bash ./scripts/setup-k8s.sh
```

### 2. Inicialización del clúster

En el nodo maestro, ejecuta:

```bash
bash ./scripts/init-master.sh
```

Este script inicializará el clúster de Kubernetes y generará un comando para unir nodos adicionales.

### 3. Unir el nodo worker

Copia el comando generado en `/root/join-command.sh` del nodo maestro y ejecútalo en el nodo worker.

### 4. Desplegar la aplicación

En el nodo maestro, ejecuta:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/mongodb.yaml
# Esperar a que MongoDB esté listo
kubectl wait --for=condition=Ready pod -l app=mongodb -n wichat-es2a --timeout=300s
# Aplicar resto de servicios
kubectl apply -f k8s/mathgame.yaml
kubectl apply -f k8s/userservice.yaml
# ... (resto de servicios)
```

### 5. Configurar port forwards

Para hacer que los servicios sean accesibles desde el exterior:

```bash
bash ./scripts/setup-port-forwards.sh
```

## Despliegue automatizado con GitHub Actions

### 1. Configurar secretos en GitHub

En la configuración de tu repositorio en GitHub, añade los siguientes secretos:

- `ORACLE_SSH_PRIVATE_KEY`: Tu clave SSH privada para acceder a las máquinas (el contenido completo de tu clave SSH privada)
- `MASTER_IP`: La dirección IP de tu nodo maestro
- `WORKER_IP`: La dirección IP de tu nodo worker
- `GITHUB_USER`: Tu nombre de usuario de GitHub (para el registro de imágenes)

### 2. Personalizar el workflow

Edita el archivo `.github/workflows/deploy-oracle-k8s.yml` para adaptarlo a tus necesidades específicas:

- Cambia las rutas o nombres de los servicios si es necesario
- Ajusta los puertos que necesitas exponer
- Modifica la política de despliegue si es necesario

### 3. Activar el despliegue

El despliegue se activará automáticamente cuando hagas push a la rama principal. También puedes activarlo manualmente desde la pestaña "Actions" en GitHub.

## Despliegue con variables de entorno

También puedes desplegar directamente desde tu máquina local usando variables de entorno:

### Usando el contenido de la clave SSH

```bash
export MASTER_IP=192.168.1.100
export WORKER_IP=192.168.1.101
export GITHUB_USER=tu-usuario-github
export SSH_USER=ubuntu
export SSH_KEY="$(cat ~/.ssh/id_rsa)"
bash ./scripts/deploy-with-env.sh
```

### Usando un archivo de clave SSH

```bash
export MASTER_IP=192.168.1.100
export WORKER_IP=192.168.1.101
export GITHUB_USER=tu-usuario-github
export SSH_USER=ubuntu
export SSH_KEY_PATH=~/.ssh/id_rsa
bash ./scripts/deploy-with-env.sh
```

## Solución de problemas

### Verificar el estado del clúster

```bash
kubectl get nodes
kubectl get pods -n wichat-es2a
kubectl get services -n wichat-es2a
```

### Logs de los servicios

```bash
kubectl logs -n wichat-es2a deployment/mathgame
kubectl logs -n wichat-es2a deployment/userservice
# ... otros servicios
```

### Reiniciar port forwards

Si los port forwards dejan de funcionar:

```bash
bash ./scripts/setup-port-forwards.sh
```

## Despliegue desde Windows con PowerShell

Si estás utilizando Windows, puedes usar el script de PowerShell proporcionado:

```powershell
# Ejecutar el script con parámetros obligatorios
.\scripts\Deploy-Oracle.ps1 -MasterIP "192.168.1.100" -WorkerIP "192.168.1.101" -SSHKeyPath "C:\Users\TuUsuario\.ssh\id_rsa"

# O con todos los parámetros
.\scripts\Deploy-Oracle.ps1 -MasterIP "192.168.1.100" -WorkerIP "192.168.1.101" -SSHKeyPath "C:\Users\TuUsuario\.ssh\id_rsa" -SSHUser "ubuntu" -GithubUser "tu-usuario-github"
```

Este script utiliza WSL (Windows Subsystem for Linux) para ejecutar los comandos bash, así que asegúrate de tener WSL instalado en tu sistema.

## Notas importantes

- Las imágenes Docker deben estar disponibles en un registro accesible desde Internet (como GitHub Container Registry)
- Los port forwards están configurados con `nohup` para mantenerlos en ejecución incluso después de cerrar la sesión SSH
- Se ha configurado un crontab para reiniciar los port forwards después de reiniciar el servidor
- Para el despliegue desde Windows, necesitarás WSL instalado (`wsl --install` en PowerShell como administrador)
