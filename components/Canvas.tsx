import { useState } from 'react';
import Image from 'next/image';
import { SectionMetadata } from '../lib/firebase';
import styles from '../styles/Canvas.module.css';

interface CanvasProps {
  selectedSections: SectionMetadata[];
  onRemoveSection: (id: string) => void;
  onReorderSections: (sections: SectionMetadata[]) => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  selectedSections, 
  onRemoveSection, 
  onReorderSections 
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewSection, setPreviewSection] = useState<string | null>(null);

  // Mover una sección hacia arriba en el orden
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newSections = [...selectedSections];
    const temp = newSections[index];
    newSections[index] = newSections[index - 1];
    newSections[index - 1] = temp;
    
    onReorderSections(newSections);
  };

  // Mover una sección hacia abajo en el orden
  const handleMoveDown = (index: number) => {
    if (index === selectedSections.length - 1) return;
    
    const newSections = [...selectedSections];
    const temp = newSections[index];
    newSections[index] = newSections[index + 1];
    newSections[index + 1] = temp;
    
    onReorderSections(newSections);
  };

  // Exportar el resultado final como JSON
  const handleExport = () => {
    // Crear el objeto final para exportar
    const exportData = {
      title: "Sitio Web Generado",
      sections: selectedSections.map(s => ({
        id: s.id,
        category: s.category,
        title: s.title,
        imagePath: s.imagePath
      }))
    };
    
    // Convertir a JSON y crear un blob
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Crear un URL para el blob y descargar
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website-sections.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (selectedSections.length === 0) {
    return (
      <div className={styles.emptyCanvas}>
        <p>Selecciona secciones de la lista para agregarlas al canvas</p>
      </div>
    );
  }

  return (
    <div className={styles.canvasContainer}>
      <div className={styles.canvasHeader}>
        <h2>Canvas de Secciones</h2>
        <button 
          className={styles.exportButton}
          onClick={handleExport}
          disabled={isLoading || selectedSections.length === 0}
        >
          Exportar JSON
        </button>
      </div>
      
      {error && <div className={styles.error}>{error}</div>}
      
      {previewSection && (
        <div className={styles.previewOverlay} onClick={() => setPreviewSection(null)}>
          <div className={styles.previewContainer}>
            <button className={styles.closePreview} onClick={() => setPreviewSection(null)}>×</button>
            <div className={styles.previewPlaceholder}>
              <h2>{previewSection}</h2>
              <p>Vista previa no disponible</p>
            </div>
          </div>
        </div>
      )}
      
      <div className={styles.sectionsList}>
        {selectedSections.map((section, index) => (
          <div key={section.id} className={styles.sectionItem}>
            <div className={styles.sectionMeta}>
              <div className={styles.sectionCode}>{section.id}</div>
              <div className={styles.sectionInfo}>
                <h3>{section.title}</h3>
                <span className={styles.sectionType}>{section.category}</span>
              </div>
            </div>
            
            <div className={styles.sectionThumbnail} onClick={() => setPreviewSection(section.category)}>
              {section.thumbnailPath ? (
                <Image 
                  src={section.thumbnailPath}
                  alt={section.title}
                  width={300}
                  height={200}
                  className={styles.thumbnailImage}
                  onError={(e) => {
                    // Si hay un error al cargar la imagen, mostrar el placeholder
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove(styles.hidden);
                  }}
                />
              ) : null}
              <div className={`${styles.thumbnailPlaceholder} ${section.thumbnailPath ? styles.hidden : ''}`}>
                <div className={styles.thumbnailCategory}>{section.category}</div>
                <div className={styles.thumbnailId}>{section.id}</div>
              </div>
            </div>
            
            <div className={styles.sectionActions}>
              <button 
                className={styles.actionButton}
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                title="Mover arriba"
              >
                ↑
              </button>
              <button 
                className={styles.actionButton}
                onClick={() => handleMoveDown(index)}
                disabled={index === selectedSections.length - 1}
                title="Mover abajo"
              >
                ↓
              </button>
              <button 
                className={styles.actionButton}
                onClick={() => onRemoveSection(section.id)}
                title="Eliminar"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {isLoading && <div className={styles.loading}>Cargando secciones...</div>}
    </div>
  );
};

export default Canvas;
