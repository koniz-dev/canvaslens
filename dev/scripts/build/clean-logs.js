#!/usr/bin/env node

/**
 * Clean log files from the dist directory
 * This script removes console.log statements and other logging code from production builds
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../../../dist');

function cleanLogsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove console.log statements
    const consoleLogRegex = /^\s*console\.log\([^)]*\);\s*$/gm;
    if (consoleLogRegex.test(content)) {
      content = content.replace(consoleLogRegex, '');
      modified = true;
    }

    // Remove console.warn statements
    const consoleWarnRegex = /^\s*console\.warn\([^)]*\);\s*$/gm;
    if (consoleWarnRegex.test(content)) {
      content = content.replace(consoleWarnRegex, '');
      modified = true;
    }

    // Remove console.info statements
    const consoleInfoRegex = /^\s*console\.info\([^)]*\);\s*$/gm;
    if (consoleInfoRegex.test(content)) {
      content = content.replace(consoleInfoRegex, '');
      modified = true;
    }

    // Remove console.debug statements
    const consoleDebugRegex = /^\s*console\.debug\([^)]*\);\s*$/gm;
    if (consoleDebugRegex.test(content)) {
      content = content.replace(consoleDebugRegex, '');
      modified = true;
    }

    // Remove empty lines that might be left behind
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleaned logs in: ${path.relative(process.cwd(), filePath)}`);
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
        cleanLogsInFile(itemPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

// Main execution
if (require.main === module) {
  console.log('Cleaning log statements from built files...');
  
  if (!fs.existsSync(distDir)) {
    console.log('Dist directory does not exist. Skipping log cleaning.');
    process.exit(0);
  }
  
  processDirectory(distDir);
  console.log('Log cleaning completed.');
}
