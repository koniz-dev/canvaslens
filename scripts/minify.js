const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

/**
 * Minify JavaScript files in dist directory for production
 * This reduces bundle size by removing whitespace, shortening variable names, etc.
 */

async function minifyFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if file is too small (likely already minified or empty)
    if (content.length < 100) {
      return;
    }
    
    const result = await minify(content, {
      compress: {
        drop_console: false, // Keep console.error and console.warn
        drop_debugger: true,
        pure_funcs: ['console.log'], // Remove console.log calls
        passes: 2
      },
      mangle: {
        toplevel: false, // Don't mangle top-level names for ES modules
        reserved: ['CanvasLensElement', 'CanvasLens'] // Keep important class names
      },
      format: {
        comments: false // Remove comments
      }
    });
    
    if (result.error) {
      console.error(`Error minifying ${filePath}:`, result.error);
      return;
    }
    
    fs.writeFileSync(filePath, result.code);
    } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

async function minifyDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      await minifyDirectory(fullPath);
    } else if (item.endsWith('.js') && !item.endsWith('.min.js')) {
      await minifyFile(fullPath);
    }
  }
}

async function main() {
  const distDir = process.argv[2] || path.join(__dirname, '..', 'dist');
  
  if (!fs.existsSync(distDir)) {
    console.error('Directory not found:', distDir);
    process.exit(1);
  }
  
  await minifyDirectory(distDir);
  }

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { minifyFile, minifyDirectory };
