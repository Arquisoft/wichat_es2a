# Script de PowerShell para desplegar en Oracle Cloud desde Windows
# Autor: Hugo Fernández
# Fecha: Mayo 2025

# Variables de configuración
param (
    [Parameter(Mandatory=$true)]
    [string]$MasterIP,

    [Parameter(Mandatory=$false)]
    [string]$WorkerIP = "",

    [Parameter(Mandatory=$true)]
    [string]$SSHKeyPath,

    [Parameter(Mandatory=$false)]
    [string]$SSHUser = "ubuntu",

    [Parameter(Mandatory=$false)]
    [string]$GithubUser = "tu-usuario-github"
)

# Verificar que existe el archivo de clave SSH
if (-not (Test-Path $SSHKeyPath)) {
    Write-Error "Error: No se encontró el archivo de clave SSH en $SSHKeyPath"
    exit 1
}

# Comprobar si existe WSL instalado
$wslCheck = wsl --list 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error: WSL no está instalado. Este script requiere WSL para ejecutar comandos bash."
    Write-Host "Por favor, instala WSL ejecutando 'wsl --install' en PowerShell como administrador."
    exit 1
}

Write-Host "Iniciando despliegue con los siguientes parámetros:"
Write-Host "Nodo master: $MasterIP"
Write-Host "Nodo worker: $WorkerIP"
Write-Host "Clave SSH: $SSHKeyPath"
Write-Host "Usuario SSH: $SSHUser"
Write-Host "Usuario GitHub: $GithubUser"

# Convertir ruta de Windows a formato WSL
$wslSSHKeyPath = wsl wslpath -a "$SSHKeyPath"

# Crear comando bash para ejecutar en WSL
$bashCommand = @"
export MASTER_IP=$MasterIP
export WORKER_IP=$WorkerIP
export SSH_KEY_PATH=$wslSSHKeyPath
export SSH_USER=$SSHUser
export GITHUB_USER=$GithubUser
cd `$(wslpath -a "$pwd")
bash ./scripts/deploy-with-env.sh
"@

# Ejecutar el comando a través de WSL
Write-Host "Ejecutando despliegue mediante WSL..."
wsl bash -c "$bashCommand"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Despliegue completado exitosamente!" -ForegroundColor Green
} else {
    Write-Error "El despliegue falló con código de error $LASTEXITCODE"
}
