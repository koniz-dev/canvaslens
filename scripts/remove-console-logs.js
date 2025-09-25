const fs = require('fs');
const path = require('path');

/**
 * Remove unnecessary console.log statements for production
 * This script removes console.log but keeps console.error and console.warn
 */

function removeConsoleLogs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Skip logger utility file
  if (filePath.includes('logger.ts') || filePath.includes('logger.js')) {
    return;
  }

  // Improved regex to handle more complex console.log patterns
  // Handles: , , multi-line, template literals
  const consoleLogRegex = /console\.log\s*\([^)]*(?:\([^)]*\))*[^)]*\);?\s*/g;
  
  // Also handle console.log with template literals and complex expressions
  const complexConsoleLogRegex = /console\.log\s*\([^;]*\);?\s*/g;
  
  let newContent = content;
  
  // Remove simple console.log statements
  newContent = newContent.replace(consoleLogRegex, (match) => {
    modified = true;
    return ''; // Remove the console.log statement
  });
  
  // Remove complex console.log statements (fallback)
  newContent = newContent.replace(complexConsoleLogRegex, (match) => {
    if (match.includes('console.log')) {
      modified = true;
      return ''; // Remove the console.log statement
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    }
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.endsWith('.js') || item.endsWith('.ts')) {
      // Skip node_modules and dist directories
      if (!fullPath.includes('node_modules') && !fullPath.includes('dist')) {
        removeConsoleLogs(fullPath);
      }
    }
  }
}

// Main execution
function main() {
  // Process specific directories
  const directories = [
    path.join(__dirname, '..', 'scripts'),
    path.join(__dirname, '..', 'src')
  ];
  
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      processDirectory(dir);
    }
  });
  
  // Process specific files
  const files = [
    path.join(__dirname, '..', 'server.js')
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      removeConsoleLogs(file);
    }
  });
  
  }

if (require.main === module) {
  main();
}

module.exports = { removeConsoleLogs, processDirectory };
