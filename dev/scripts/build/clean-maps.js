#!/usr/bin/env node

/**
 * Clean source map files from the dist directory
 * This script removes .map files and source map references from production builds
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../../../dist');

function cleanSourceMapsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove source map references
    const sourceMapRegex = /\/\/# sourceMappingURL=[^\s]+/g;
    if (sourceMapRegex.test(content)) {
      content = content.replace(sourceMapRegex, '');
      modified = true;
    }

    // Remove sourceURL references
    const sourceUrlRegex = /\/\/# sourceURL=[^\s]+/g;
    if (sourceUrlRegex.test(content)) {
      content = content.replace(sourceUrlRegex, '');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleaned source maps in: ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function removeSourceMapFiles(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        removeSourceMapFiles(itemPath);
      } else if (item.endsWith('.map')) {
        fs.unlinkSync(itemPath);
        console.log(`Removed source map: ${path.relative(process.cwd(), itemPath)}`);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
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
        cleanSourceMapsInFile(itemPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

// Main execution
if (require.main === module) {
  console.log('Cleaning source maps from built files...');
  
  if (!fs.existsSync(distDir)) {
    console.log('Dist directory does not exist. Skipping source map cleaning.');
    process.exit(0);
  }
  
  // First, remove all .map files
  removeSourceMapFiles(distDir);
  
  // Then, remove source map references from .js files
  processDirectory(distDir);
  
  console.log('Source map cleaning completed.');
}
