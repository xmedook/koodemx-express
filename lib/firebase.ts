// Interfaz para los metadatos de secciones
export interface SectionMetadata {
  id: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  imagePath: string;
}

/**
 * Obtiene secciones de la base de datos local basadas en categorías
 * @param categories - Lista de categorías a buscar
 * @returns Lista de secciones que coinciden con las categorías
 */
export async function getSectionsByCategories(categories: string[]): Promise<SectionMetadata[]> {
  try {
    // Importar el JSON de secciones
    const sectionsData = require('../data/sections-index.json');
    
    // Verificar que sectionsData.sections existe y es un array
    if (!sectionsData.sections || !Array.isArray(sectionsData.sections)) {
      console.error("Error: sectionsData.sections no es un array válido");
      return [];
    }
    
    // Filtrar secciones por categoría
    const filteredSections = sectionsData.sections.filter((section: SectionMetadata) => 
      categories.includes(section.category)
    );
    
    return filteredSections;
  } catch (error) {
    console.error("Error al obtener secciones:", error);
    return [];
  }
}

// Nota: Esta versión utiliza solo el JSON local sin Firebase
// En una implementación real, aquí se conectaría a Firestore
