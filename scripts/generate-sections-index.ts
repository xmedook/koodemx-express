// ESM compatible imports
import { writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Categories from pages/index.tsx
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

// Initial IDs for specific categories (based on existing structure)
const CATEGORY_ID_MAP: Record<string, number> = {
  "404 page": 2391,
  "blog carousel": 1932,
  "blog grid": 2100,
  "call to action": 2200,
  "hero": 2300,
  "footer": 2400,
  // Other IDs will be assigned sequentially
};

interface Section {
  id: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  imagePath: string;
}

interface SectionsIndex {
  version: string;
  lastUpdated: string;
  sections: Section[];
}

const generateSectionsIndex = () => {
  console.log(chalk.bold('Starting sections index generation from existing PNG files...'));
  
  const sections: Section[] = [];
  const sectionsDirPath = join(process.cwd(), 'public', 'sections');
  
  // Get all category directories
  const categoryDirs = readdirSync(sectionsDirPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(chalk.blue(`Found ${categoryDirs.length} category directories`));
  
  // Process each category directory
  categoryDirs.forEach(normalizedCategory => {
    // Convert directory name to category name format
    const category = normalizedCategory.replace(/-/g, ' ');
    const categoryPath = join(sectionsDirPath, normalizedCategory);
    
    // Get all PNG files in the category directory
    const pngFiles = readdirSync(categoryPath)
      .filter(file => file.toLowerCase().endsWith('.png'))
      .sort();
    
    console.log(`Found ${pngFiles.length} PNG files in ${normalizedCategory}`);
    
    // Create a section for each PNG file
    pngFiles.forEach(pngFile => {
      // Get section ID from filename (without extension)
      const id = pngFile.replace(/\.png$/i, '');
      
      // Create title with capitalized category
      const capitalizedCategory = category
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Generate random variant for title variation
      const variants = ['Clean', 'Modern', 'Simple', 'Creative', 'Elegant', 'Bold', 'Minimal', 'Professional', 'Interactive', 'Standard'];
      const variant = variants[Math.floor(Math.random() * variants.length)];
      
      // Generate tags
      const tags = [
        category.toLowerCase(),
        variant.toLowerCase(),
        category.split(' ')[0]
      ];
      
      sections.push({
        id,
        category,
        title: `${capitalizedCategory} ${variant}`,
        description: `A ${variant.toLowerCase()} design for ${category} sections`,
        tags,
        imagePath: `/sections/${normalizedCategory}/${pngFile}`
      });
    });
  });
  
  // Create the final object
  const sectionsIndex: SectionsIndex = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString().split('T')[0],
    sections
  };
  
  // Save the file
  const outputPath = join(process.cwd(), 'data', 'sections-index.json');
  try {
    // Create data directory if it doesn't exist
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      console.log(chalk.yellow('Creating data directory...'));
      require('fs').mkdirSync(dataDir, { recursive: true });
    }
    
    writeFileSync(outputPath, JSON.stringify(sectionsIndex, null, 2));
    console.log(chalk.green(`✓ File successfully generated at ${outputPath}`));
    console.log(chalk.blue(`Total sections generated: ${sections.length}`));
  } catch (error) {
    console.error(chalk.red('Error saving file:'), error);
    process.exit(1);
  }
};

// Run the generation
generateSectionsIndex();

