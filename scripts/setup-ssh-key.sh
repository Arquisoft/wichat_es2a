#!/bin/bash
# Script para configurar la clave SSH desde un GitHub Secret

# Obtener la clave SSH desde el secret y guardarla en un archivo
echo "$1" > /tmp/id_rsa
chmod 600 /tmp/id_rsa

echo "Clave SSH configurada en /tmp/id_rsa"
