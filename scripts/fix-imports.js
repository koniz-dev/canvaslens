const fs = require('fs');
const path = require('path');

function findJsFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            findJsFiles(fullPath, files);
        } else if (item.endsWith('.js') || item.endsWith('.d.ts')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    const fixPath = (match, importPath) => {
        if (importPath.endsWith('.js') || importPath.startsWith('http') || importPath.startsWith('data:')) {
            return match;
        }
        
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
            modified = true;
            const lastPart = importPath.split('/').pop();
            
            if (!lastPart.includes('.')) {
                const possibleFilePath = path.join(path.dirname(filePath), importPath + '.js');
                const possibleDirPath = path.join(path.dirname(filePath), importPath, 'index.js');
                
                if (fs.existsSync(possibleFilePath)) {
                    return match.replace(importPath, importPath + '.js');
                } else if (fs.existsSync(possibleDirPath)) {
                    return match.replace(importPath, importPath + '/index.js');
                } else {
                    return match.replace(importPath, importPath + '.js');
                }
            } else {
                return match.replace(importPath, importPath + '.js');
            }
        }
        
        return match;
    };
    
    const regex = /(?:import|export)\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+|\*)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+['"`]([^'"`]+)['"`]/g;
    content = content.replace(regex, fixPath);
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

function main() {
    const distDir = process.argv[2] || path.join(__dirname, '..', 'dist');
    
    if (!fs.existsSync(distDir)) {
        console.error('Directory not found:', distDir);
        process.exit(1);
    }
    
    const jsFiles = findJsFiles(distDir);
    for (const file of jsFiles) {
        fixImportsInFile(file);
    }
}

if (require.main === module) {
    main();
}

module.exports = { fixImportsInFile, findJsFiles };