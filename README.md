# KoodeMX Express

Una aplicación web que utiliza IA para sugerir secciones de sitios web basadas en prompts del usuario.

## Descripción

KoodeMX Express es un MVP que permite a los usuarios ingresar un prompt (por ejemplo, "quiero una web para una agencia creativa") y recibir sugerencias de secciones recomendadas (como hero, servicios, CTA, footer, etc.), utilizando una base de datos local de secciones prediseñadas con imágenes PNG.

## Funcionalidades

- Generación de sugerencias de secciones basadas en prompts del usuario usando OpenAI
- Visualización de secciones disponibles que coinciden con las categorías sugeridas
- Filtrado por categorías (64 categorías disponibles)
- Búsqueda de secciones por texto
- Agregar secciones al canvas para construir la estructura del sitio web
- Reordenar secciones en el canvas (mover arriba/abajo)
- Eliminar secciones del canvas
- Vista previa de secciones en tamaño completo
- Exportar el resultado final como un archivo JSON con la estructura del sitio

## Stack Tecnológico

- **Frontend**: Next.js con TypeScript
- **Backend**: API Routes de Next.js
- **IA**: OpenAI API (GPT-3.5)
- **Datos**: Imágenes PNG y archivo de índice JSON
- **Procesamiento de imágenes**: Sharp

## Estructura del Proyecto

- `/pages/index.tsx` → Interfaz principal con input de prompt y canvas
- `/pages/api/suggest.ts` → Recibe el prompt, consulta OpenAI, devuelve sugerencias
- `/components/Canvas.tsx` → Componente para gestionar las secciones seleccionadas
- `/lib/openai.ts` → Cliente de OpenAI
- `/lib/firebase.ts` → Funciones para acceder a los datos (nombre histórico)
- `/data/sections-index.json` → Archivo con metadatos de secciones
- `/public/sections/[category]/` → Directorios con imágenes PNG de secciones
- `/public/thumbnails/` → Miniaturas WebP optimizadas
- `/scripts/process-images.js` → Script para procesar imágenes y generar índice
- `/styles/Home.module.css` → Estilos para la página principal
- `/styles/Canvas.module.css` → Estilos para el componente Canvas

## Requisitos Previos

1. Node.js y npm instalados
2. Cuenta en OpenAI y API Key
3. Imágenes de secciones en formato PNG

## Configuración

1. Clona este repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno:
   - Crea un archivo `.env.local` en la raíz del proyecto
   - Añade la siguiente variable:
     ```
     # OpenAI API Key
     OPENAI_API_KEY=tu_api_key_de_openai
     ```

4. Procesa las imágenes de secciones:
   - Coloca las imágenes PNG en el directorio especificado en `scripts/process-sections.sh`
   - Ejecuta el script de procesamiento:
     ```bash
     cd koodemx-express
     ./scripts/process-sections.sh
     ```
   - Este script generará miniaturas WebP y creará el archivo de índice

5. Inicia la aplicación:
   ```bash
   npm run dev
   ```

6. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## Uso

1. Ingresa un prompt en el campo de texto (por ejemplo, "quiero una web para una agencia creativa")
2. Haz clic en "Generar Sugerencias"
3. La aplicación consultará a OpenAI para interpretar el prompt y sugerir secciones
4. Se mostrarán las secciones recomendadas y las secciones disponibles filtradas por categoría
5. Puedes filtrar por categoría o buscar secciones específicas
6. Agrega secciones al canvas haciendo clic en el botón "Agregar"
7. Haz clic en la miniatura para ver la sección en tamaño completo
8. Reordena las secciones usando los botones de flecha (↑ ↓)
9. Elimina secciones del canvas con el botón X
10. Cuando estés satisfecho con la estructura, haz clic en "Exportar JSON" para descargar el resultado final

## Estructura del JSON Exportado

El archivo JSON exportado tiene la siguiente estructura:

```json
{
  "title": "Sitio Web Generado",
  "sections": [
    {
      "id": "c1001",
      "category": "hero",
      "title": "Hero Moderno",
      "imagePath": "/sections/hero/c1001.png"
    },
    {
      "id": "c2001",
      "category": "services",
      "title": "Servicios con Iconos",
      "imagePath": "/sections/services/c2001.png"
    }
  ]
}
```

## Desarrollo Futuro

- Implementar autenticación de usuarios
- Integrar Firebase para almacenamiento persistente
- Añadir funcionalidad para guardar proyectos
- Permitir la exportación de secciones seleccionadas como código HTML/CSS
- Integrar más plantillas y opciones de personalización
- Añadir vista previa en tiempo real del sitio web generado
- Implementar un sistema de etiquetado automático con IA
