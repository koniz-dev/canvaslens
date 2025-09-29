#!/usr/bin/env node

/**
 * Fix import paths in the built JavaScript files
 * This script ensures that import statements use the correct file extensions
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../../../dist');

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix relative imports to include .js extension
    const importRegex = /import\s+.*?\s+from\s+['"](\.\/?[^'"]+)['"]/g;
    content = content.replace(importRegex, (match, importPath) => {
      if (!importPath.endsWith('.js')) {
        modified = true;
        // Check if it's a directory import (no extension and no trailing slash)
        const dirPath = path.join(path.dirname(filePath), importPath);
        if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
          // It's a directory, add /index.js
          return match.replace(importPath, importPath + '/index.js');
        } else {
          // It's a file, add .js
          return match.replace(importPath, importPath + '.js');
        }
      }
      return match;
    });

    // Fix export statements
    const exportRegex = /export\s+.*?\s+from\s+['"](\.\/?[^'"]+)['"]/g;
    content = content.replace(exportRegex, (match, exportPath) => {
      if (!exportPath.endsWith('.js')) {
        modified = true;
        // Check if it's a directory import (no extension and no trailing slash)
        const dirPath = path.join(path.dirname(filePath), exportPath);
        if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
          // It's a directory, add /index.js
          return match.replace(exportPath, exportPath + '/index.js');
        } else {
          // It's a file, add .js
          return match.replace(exportPath, exportPath + '.js');
        }
      }
      return match;
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed imports in: ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        processDirectory(itemPath);
      } else if (item.endsWith('.js')) {
        fixImportsInFile(itemPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

// Main execution
if (require.main === module) {
  console.log('Fixing import paths in built files...');
  
  if (!fs.existsSync(distDir)) {
    console.log('Dist directory does not exist. Skipping import fixes.');
    process.exit(0);
  }
  
  processDirectory(distDir);
  console.log('Import path fixing completed.');
}
