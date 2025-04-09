      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create a URL for the blob and download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'website-sections.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error exporting sections: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const activeSection = activeId ? sections.find(section => section.id === activeId) : null;

  return (
    <div className={styles.canvas}>
      <div className={styles.canvasHeader}>
        <h2>Canvas</h2>
        {sections.length > 0 && (
          <button 
            className={styles.exportButton}
            onClick={handleExport}
            disabled={isLoading}
            title="Export as JSON"
          >
            {isLoading ? 'Exporting...' : 'Export'}
          </button>
        )}
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {sections.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sections.map(section => section.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className={styles.canvasList}>
              {sections.map((section) => (
                <SortableItem
                  key={section.id}
                  section={section}
                  onPreview={setPreviewSection}
                  onRemove={onRemoveSection}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className={styles.emptyState}>
          Select sections to add to your canvas
        </div>
      )}

      {/* Preview Modal */}
      {previewSection && (
        <div 
          className={styles.previewOverlay} 
          
