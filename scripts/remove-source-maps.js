const fs = require('fs');
const path = require('path');

/**
 * Remove source map files (.map) from dist directory for production
 * This reduces package size and removes unnecessary debug files
 */

function removeSourceMaps(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      removeSourceMaps(fullPath);
    } else if (item.endsWith('.map')) {
      fs.unlinkSync(fullPath);
      }
  }
}

function main() {
  const distDir = process.argv[2] || path.join(__dirname, '..', 'dist');
  
  if (!fs.existsSync(distDir)) {
    console.error('Directory not found:', distDir);
    process.exit(1);
  }
  
  removeSourceMaps(distDir);
  }

if (require.main === module) {
  main();
}

module.exports = { removeSourceMaps };
