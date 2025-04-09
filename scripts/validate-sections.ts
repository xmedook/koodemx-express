// ESM compatible imports
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Get directory path for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const REQUIRED_TOP_LEVEL_FIELDS = ['version', 'lastUpdated', 'sections'];
const REQUIRED_SECTION_FIELDS = ['id', 'category', 'title', 'description', 'tags', 'imagePath'];

const validateSectionsIndex = async () => {
  console.log(chalk.bold('Validating sections-index.json...'));
  
  // Read and parse the sections-index.json file
  let sectionsIndex: SectionsIndex;
  try {
    const filePath = join(process.cwd(), 'data', 'sections-index.json');
    const fileContent = readFileSync(filePath, 'utf8');
    sectionsIndex = JSON.parse(fileContent);
  } catch (error) {
    console.error(chalk.red('Error reading or parsing sections-index.json:'), error);
    process.exit(1);
  }

  const issues: string[] = [];
  const stats = {
    totalSections: 0,
    validSections: 0,
    missingFiles: 0,
    categoryCounts: {} as Record<string, number>,
  };

  // 1. Check for required top-level fields
  for (const field of REQUIRED_TOP_LEVEL_FIELDS) {
    if (!(field in sectionsIndex)) {
      issues.push(`Missing required top-level field: ${field}`);
    }
  }

  // Check if sections is an array
  if (!Array.isArray(sectionsIndex.sections)) {
    issues.push('The sections field must be an array');
    // Can't continue validation without sections array
    console.log(chalk.red('\nValidation failed:'));
    issues.forEach(issue => console.log(chalk.red(`- ${issue}`)));
    process.exit(1);
  }

  stats.totalSections = sectionsIndex.sections.length;

  // 2 & 3. Validate each section and verify files exist
  for (let i = 0; i < sectionsIndex.sections.length; i++) {
    const section = sectionsIndex.sections[i];
    const sectionIssues: string[] = [];
    
    // Check required fields
    for (const field of REQUIRED_SECTION_FIELDS) {
      if (!(field in section) || section[field as keyof Section] === undefined) {
        sectionIssues.push(`Missing required field: ${field}`);
      }
    }

    // Verify image file exists and follows correct pattern
    if (section.imagePath) {
      // Verify path pattern: /sections/{normalized-category}/{id}.png
      const expectedPattern = new RegExp(`^/sections/${section.category.replace(/ /g, '-').toLowerCase()}/.*\\.png$`);
      if (!expectedPattern.test(section.imagePath)) {
        sectionIssues.push(`Invalid image path format: ${section.imagePath}. Expected pattern: /sections/{normalized-category}/{id}.png`);
      }
      
      // Check if file exists in public directory
      const imagePath = join(process.cwd(), 'public', section.imagePath);
      if (!existsSync(imagePath)) {
        sectionIssues.push(`Image file not found: ${section.imagePath}`);
        stats.missingFiles++;
      }
      
      // Ensure it's a PNG file
      if (!section.imagePath.endsWith('.png')) {
        sectionIssues.push(`Image is not a PNG file: ${section.imagePath}`);
      }
    }

    // Track category counts
    if (section.category) {
      stats.categoryCounts[section.category] = (stats.categoryCounts[section.category] || 0) + 1;
    }

    // Add section issues to main issues list
    if (sectionIssues.length > 0) {
      issues.push(`Section ${i + 1} (ID: ${section.id || 'unknown'}):`);
      sectionIssues.forEach(issue => issues.push(`  - ${issue}`));
    } else {
      stats.validSections++;
    }
  }

  // 4. Generate the report
  console.log(chalk.bold('\nValidation Report:'));
  console.log(`Total sections: ${stats.totalSections}`);
  console.log(`Valid sections: ${stats.validSections}`);
  console.log(`Missing files: ${stats.missingFiles}`);
  
  // Report on categories
  console.log(chalk.bold('\nCategories:'));
  const categories = Object.keys(stats.categoryCounts).sort();
  console.log(`Found ${categories.length} unique categories`);
  categories.forEach(category => {
    console.log(`- ${category}: ${stats.categoryCounts[category]} sections`);
  });

  // Report issues
  if (issues.length > 0) {
    console.log(chalk.yellow('\nIssues found:'));
    issues.forEach(issue => console.log(chalk.yellow(issue)));
    console.log(chalk.red(`\nValidation completed with ${issues.length} issues`));
  } else {
    console.log(chalk.green('\nValidation completed successfully with no issues!'));
  }
}

// Self-invoking async function to run the validation
(async () => {
  try {
    await validateSectionsIndex();
  } catch (error) {
    console.error(chalk.red('An error occurred during validation:'), error);
    process.exit(1);
  }
})();

