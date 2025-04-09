import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { SectionSuggestion } from '../lib/openai';
import { SectionMetadata } from '../lib/firebase';
import Canvas from '../components/Canvas';

// Lista de categorías disponibles
const CATEGORIES = [
  "404 page", "blog carousel", "blog grid", "call to action", "call to action slider", 
  "checkout page", "coming soon", "contact", "content", "content slider", "counter", 
  "counter carousel", "email opt in", "faq", "faq slider", "features", "footer", 
  "full width duo", "full width duo slider", "gallery", "gallery carousel", "heading", 
  "hero", "hero slider", "icon box", "icon box carousel", "image box", "image box carousel", 
  "kickstart", "kickstart slider", "list", "list slider", "login page", "logo grid", 
  "logo grid carousel", "mega menu", "navbar", "portfolio carousel", "portfolio grid", 
  "price list", "price list carousel", "pricing table", "product carousel", "product grid", 
  "shopping cart", "single portfolio", "single post", "single product", "social", 
  "social carousel", "step box carousel", "stepbox", "team grid", "team grid carousel", 
  "testimonial", "testimonial carousel", "text box", "text box carousel", "text slider", 
  "timeline", "timeline slider", "video", "video carousel", "working hours"
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SectionSuggestion[]>([]);
  const [selectedSections, setSelectedSections] = useState<SectionMetadata[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categorySections, setCategorySections] = useState<SectionMetadata[]>([]);
  const [isLoadingCategory, setIsLoadingCategory] = useState<boolean>(false);

  // Mapa de categorías a IDs iniciales para thumbnails existentes
  const CATEGORY_ID_MAP: Record<string, number> = {
    "404 page": 2391,
    "blog carousel": 1932,
    "blog grid": 2100, // Valor ficticio, ajustar según los archivos reales
    "call to action": 2200, // Valor ficticio, ajustar según los archivos reales
    "hero": 2300, // Valor ficticio, ajustar según los archivos reales
    "footer": 2400, // Valor ficticio, ajustar según los archivos reales
    // Añadir más categorías según sea necesario
  };

  // Cargar secciones de una categoría específica
  const loadCategorySections = async (category: string) => {
    console.log('Cargando secciones para categoría:', category);
    setIsLoadingCategory(true);
    
    try {
      // Normalizar el nombre de la categoría para la ruta de archivo
      const normalizedCategory = category.replace(/ /g, '-').toLowerCase();
      console.log('Categoría normalizada:', normalizedCategory);
      
      // Crear secciones para esta categoría
      const sections: SectionMetadata[] = [];
      
      // Obtener el ID inicial para esta categoría o usar un valor predeterminado
      const startId = CATEGORY_ID_MAP[category] || 2000;
      
      // Generar IDs basados en la categoría para simular secciones reales
      // En una implementación real, esto cargaría desde una API o base de datos
      for (let i = 0; i < 10; i++) {
        // Usar un ID que coincida con los thumbnails existentes
        const id = `c${startId + (i * 2)}`; // Incrementar de 2 en 2 para coincidir con el patrón observado
        
        // Normalizar el nombre de la categoría para la ruta de archivo
        const normalizedCategory = category.replace(/ /g, '-').toLowerCase();
        
        sections.push({
          id,
          title: `${category.charAt(0).toUpperCase() + category.slice(1)} ${i + 1}`,
          category,
          tags: [category],
          description: `Sección de ${category}`,
          // Usar rutas de imágenes basadas en los IDs generados
          imagePath: `/sections/${normalizedCategory}/${id}.png`,
          thumbnailPath: `/thumbnails/${normalizedCategory}-${id}.webp`
        });
      }
      
      console.log('Secciones generadas:', sections.length);
      console.log('Primera sección:', sections[0]);
      setCategorySections(sections);
    } catch (err) {
      console.error('Error al cargar secciones de categoría:', err);
    } finally {
      setIsLoadingCategory(false);
    }
  };

  // Manejar clic en categoría
  const handleCategoryClick = (category: string) => {
    console.log('Categoría seleccionada:', category);
    setSelectedCategory(category);
    loadCategorySections(category);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Por favor, ingresa un prompt');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al procesar la solicitud');
      }

      setSuggestions(data.suggestions || []);
      
      // Si hay sugerencias, seleccionar la primera categoría
      if (data.suggestions && data.suggestions.length > 0) {
        const firstCategory = data.suggestions[0].category;
        setSelectedCategory(firstCategory);
        loadCategorySections(firstCategory);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  // Agregar una sección al canvas
  const handleAddSection = (section: SectionMetadata) => {
    if (!selectedSections.some(s => s.id === section.id)) {
      setSelectedSections([...selectedSections, section]);
    }
  };

  // Eliminar una sección del canvas
  const handleRemoveSection = (id: string) => {
    setSelectedSections(selectedSections.filter(section => section.id !== id));
  };

  // Reordenar las secciones en el canvas
  const handleReorderSections = (newSections: SectionMetadata[]) => {
    setSelectedSections(newSections);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>KoodeMX Express</title>
        <meta name="description" content="Generador de secciones web con IA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          KoodeMX <span className={styles.highlight}>Express</span>
        </h1>

        <p className={styles.description}>
          Describe tu proyecto web y te sugeriremos las secciones ideales
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <textarea
            className={styles.textarea}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: Quiero una web para una agencia creativa"
            rows={4}
          />
          
          <button 
            type="submit" 
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Generando...' : 'Generar Sugerencias'}
          </button>
        </form>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.threeColumnLayout}>
          {/* Columna de categorías */}
          <div className={styles.categoriesColumn}>
            <h2>Categorías</h2>
            <div className={styles.categoriesList}>
              {CATEGORIES.map(category => (
                <div 
                  key={category} 
                  className={`${styles.categoryItem} ${selectedCategory === category ? styles.categoryItemActive : ''}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </div>
              ))}
            </div>
          </div>
          
          {/* Columna de secciones */}
          <div className={styles.sectionsColumn}>
            {suggestions.length > 0 && (
              <div className={styles.results}>
                <h2>Secciones Recomendadas</h2>
                
                <div className={styles.suggestionsGrid}>
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className={styles.card}>
                      <h3>{suggestion.title}</h3>
                      <span 
                        className={styles.category}
                        onClick={() => handleCategoryClick(suggestion.category)}
                      >
                        {suggestion.category}
                      </span>
                      <p>{suggestion.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedCategory ? (
              <div className={styles.results}>
                <h2>Secciones de {selectedCategory}</h2>
                
                {isLoadingCategory ? (
                  <div className={styles.loading}>Cargando secciones...</div>
                ) : categorySections.length > 0 ? (
                  <div className={styles.sectionsList}>
                    {categorySections.map((section) => (
                      <div 
                        key={section.id} 
                        className={`${styles.sectionItem} ${selectedSections.some(s => s.id === section.id) ? styles.sectionItemAdded : ''}`}
                        onClick={() => !selectedSections.some(s => s.id === section.id) && handleAddSection(section)}
                      >
                        <div className={styles.sectionInfo}>
                          <h3>{section.title} <span className={styles.sectionCode}>({section.id})</span></h3>
                          {section.thumbnailPath ? (
                            <div className={styles.imageContainer}>
                              <Image 
                                src={section.thumbnailPath}
                                alt={section.title}
                                width={300}
                                height={200}
                                className={styles.sectionImage}
                                onError={(e) => {
                                  // Si hay un error al cargar la imagen, mostrar el placeholder
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove(styles.hidden);
                                }}
                              />
                              <div className={`${styles.placeholderImage} ${styles.hidden}`}>
                                {section.category}
                              </div>
                            </div>
                          ) : (
                            <div className={styles.placeholderImage}>
                              {section.category}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noResults}>
                    No se encontraron secciones para esta categoría.
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.selectCategory}>
                Selecciona una categoría para ver las secciones disponibles
              </div>
            )}
          </div>
          
          {/* Columna del canvas */}
          <div className={styles.canvasColumn}>
            <Canvas 
              selectedSections={selectedSections}
              onRemoveSection={handleRemoveSection}
              onReorderSections={handleReorderSections}
            />
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Powered by Next.js, OpenAI y Firebase</p>
      </footer>
    </div>
  );
}
