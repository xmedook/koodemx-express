const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

// Configuración
const SOURCE_DIR = '/Users/aposada/Downloads/3500-sections/VS code scrapper/scraped_images';
const TARGET_DIR = path.join(__dirname, '../public/sections');
const THUMBNAILS_DIR = path.join(__dirname, '../public/thumbnails');
const INDEX_FILE = path.join(__dirname, '../data/sections-index.json');

// Asegurarse de que los directorios existan
fs.ensureDirSync(TARGET_DIR);
fs.ensureDirSync(THUMBNAILS_DIR);
fs.ensureDirSync(path.dirname(INDEX_FILE));

// Función para procesar una imagen
async function processImage(sourcePath, category, filename) {
  const id = path.basename(filename, '.png');
  const targetPath = path.join(TARGET_DIR, category, filename);
  const thumbnailPath = path.join(THUMBNAILS_DIR, `${category}-${id}.webp`);
  
  // Crear directorio de categoría si no existe
  fs.ensureDirSync(path.join(TARGET_DIR, category));
  
  // Copiar imagen original
  await fs.copy(sourcePath, targetPath);
  
  // Generar miniatura WebP
  await sharp(sourcePath)
    .resize(300) // Ancho de 300px, altura proporcional
    .webp({ quality: 80 })
    .toFile(thumbnailPath);
  
  return {
    id,
    category,
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} ${id}`,
    description: `Sección de ${category}`,
    tags: [category],
    imagePath: `/sections/${category}/${filename}`,
    thumbnailPath: `/thumbnails/${category}-${id}.webp`
  };
}

// Función principal
async function main() {
  console.log('Iniciando procesamiento de imágenes...');
  
  const index = {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    sections: [],
    categories: {}
  };
  
  try {
    // Leer categorías (directorios)
    const categories = await fs.readdir(SOURCE_DIR);
    
    for (const category of categories) {
      const categoryPath = path.join(SOURCE_DIR, category);
      const stats = await fs.stat(categoryPath);
      
      // Verificar que sea un directorio
      if (!stats.isDirectory()) continue;
      
      console.log(`Procesando categoría: ${category}`);
      
      // Inicializar contador de categoría
      index.categories[category] = {
        count: 0,
        subcategories: []
      };
      
      // Leer imágenes de la categoría
      const files = await fs.readdir(categoryPath);
      const pngFiles = files.filter(file => file.toLowerCase().endsWith('.png'));
      
      // Actualizar contador
      index.categories[category].count = pngFiles.length;
      
      // Procesar cada imagen
      for (const file of pngFiles) {
        const sourcePath = path.join(categoryPath, file);
        try {
          const sectionData = await processImage(sourcePath, category, file);
          index.sections.push(sectionData);
          console.log(`  Procesada: ${file}`);
        } catch (err) {
          console.error(`  Error al procesar ${file}: ${err.message}`);
        }
      }
    }
    
    // Guardar archivo de índice
    await fs.writeJson(INDEX_FILE, index, { spaces: 2 });
    console.log(`Archivo de índice guardado en ${INDEX_FILE}`);
    console.log(`Total de secciones procesadas: ${index.sections.length}`);
    
  } catch (err) {
    console.error('Error durante el procesamiento:', err);
  }
}

// Ejecutar función principal
main().catch(console.error);
