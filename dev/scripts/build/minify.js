#!/usr/bin/env node

/**
 * Minify JavaScript files in the dist directory
 * This script uses terser to minify JavaScript files for production
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const distDir = path.join(__dirname, '../../../dist');

async function minifyFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const result = await minify(content, {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2
      },
      mangle: {
        toplevel: true
      },
      format: {
        comments: false
      }
    });

    if (result.error) {
      console.error(`Error minifying ${filePath}:`, result.error);
      return;
    }

    fs.writeFileSync(filePath, result.code, 'utf8');
    console.log(`Minified: ${path.relative(process.cwd(), filePath)}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

async function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        await processDirectory(itemPath);
      } else if (item.endsWith('.js') && !item.endsWith('.min.js')) {
        await minifyFile(itemPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

// Main execution
if (require.main === module) {
  console.log('Minifying JavaScript files...');
  
  if (!fs.existsSync(distDir)) {
    console.log('Dist directory does not exist. Skipping minification.');
    process.exit(0);
  }
  
  processDirectory(distDir)
    .then(() => {
      console.log('Minification completed.');
    })
    .catch((error) => {
      console.error('Minification failed:', error);
      process.exit(1);
    });
}
