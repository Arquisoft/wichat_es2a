# Despliegue con los Secrets de GitHub existentes

Este documento explica cómo desplegar la aplicación WiChat en Oracle Cloud usando las variables de entorno existentes `DEPLOY_KEY`, `DEPLOY_HOST` y `DEPLOY_USER`.

## Configuración de las variables de entorno

Estas variables se deben configurar como GitHub Secrets para el despliegue automático, o como variables de entorno para el despliegue manual:

### Variables para el nodo master (requeridas)
- `DEPLOY_KEY`: Contenido de la clave SSH privada para acceder al servidor Oracle Cloud (master)
- `DEPLOY_HOST`: Dirección IP del servidor Oracle Cloud principal (master)
- `DEPLOY_USER`: Usuario SSH para acceder al servidor master (por defecto: "ubuntu")

### Variables para el nodo worker (opcionales)
- `WORKER_IP`: Dirección IP del servidor Oracle Cloud secundario (worker)
- `WORKER_DEPLOY_KEY`: Contenido de la clave SSH privada para acceder al worker (opcional, si es diferente a DEPLOY_KEY)
- `WORKER_DEPLOY_USER`: Usuario SSH para acceder al worker (opcional, si es diferente a DEPLOY_USER)

## Opción 1: Despliegue usando GitHub Actions

1. **Configura los Secrets en GitHub**:
   - Ve a tu repositorio GitHub > Settings > Secrets and variables > Actions
   - Añade los secrets `DEPLOY_KEY`, `DEPLOY_HOST` y `DEPLOY_USER`

2. **Activa el workflow de despliegue**:
   - Realiza un push a la rama principal o inicia manualmente el workflow desde la pestaña Actions

## Opción 2: Despliegue manual desde Linux/Mac

```bash
# Configura las variables de entorno
export DEPLOY_KEY="$(cat ~/.ssh/id_rsa)"  # Contenido de tu clave SSH
export DEPLOY_HOST="192.168.1.100"        # IP del servidor
export DEPLOY_USER="ubuntu"               # Usuario SSH

# Ejecuta el script de despliegue
bash ./scripts/deploy-simple.sh
```

## Opción 3: Despliegue manual desde Windows usando PowerShell

```powershell
# Ejecutar con WSL (necesitas tener WSL instalado)
$env:DEPLOY_HOST = "192.168.1.100"
$env:DEPLOY_USER = "ubuntu"
$env:DEPLOY_KEY = Get-Content -Path "C:\Users\TuUsuario\.ssh\id_rsa" -Raw

# Con WSL
wsl bash -c "cd \`$(wslpath -a '$PWD') && export DEPLOY_HOST=$env:DEPLOY_HOST && export DEPLOY_USER=$env:DEPLOY_USER && export DEPLOY_KEY='$env:DEPLOY_KEY' && bash ./scripts/deploy-simple.sh"

# O usar directamente el script PowerShell
.\scripts\Deploy-Oracle.ps1 -MasterIP "192.168.1.100" -SSHKeyPath "C:\Users\TuUsuario\.ssh\id_rsa" -SSHUser "ubuntu"
```

## Configuración avanzada

Si necesitas configurar una instalación de Kubernetes con dos nodos (master + worker), puedes usar el script `deploy-with-env.sh` que permite configurar ambas máquinas:

```bash
# Configuración básica
export DEPLOY_HOST="192.168.1.100"  # IP del master (requerido)
export DEPLOY_USER="ubuntu"         # Usuario SSH (opcional)
export DEPLOY_KEY="$(cat ~/.ssh/id_rsa)"  # Clave SSH (requerido)

# Configuración avanzada (opcional)
export WORKER_IP="192.168.1.101"    # IP del worker (opcional)

# Ejecutar despliegue avanzado
bash ./scripts/deploy-with-env.sh
```

## Notas importantes

- Si solo configuras `DEPLOY_HOST` (sin `WORKER_IP`), se creará un clúster Kubernetes de un solo nodo.
- Si configuras tanto `DEPLOY_HOST` como `WORKER_IP`, se creará un clúster con un nodo master y un nodo worker.
- Asegúrate de que la clave SSH tenga los permisos adecuados (chmod 600) en tu sistema.
- Los port-forwards se configuran automáticamente y se reinician después de reiniciar el servidor.
