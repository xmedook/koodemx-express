#!/bin/bash

# Script para procesar las imágenes de secciones y generar el índice

# Verificar que el directorio de origen existe
SOURCE_DIR="/Users/aposada/Downloads/3500-sections/VS code scrapper/scraped_images"
if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: El directorio de origen no existe: $SOURCE_DIR"
  exit 1
fi

# Crear directorios necesarios
mkdir -p public/thumbnails

# Instalar dependencias si es necesario
if [ ! -d "node_modules/sharp" ]; then
  echo "Instalando dependencias..."
  npm install sharp fs-extra
fi

# Ejecutar el script de procesamiento
echo "Iniciando procesamiento de imágenes..."
node scripts/process-images.js

echo "Procesamiento completado."
