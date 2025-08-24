const fs = require('fs');
const path = require('path');

// Function to recursively find all .js files in a directory
function findJsFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            findJsFiles(fullPath, files);
        } else if (item.endsWith('.js') && !item.endsWith('.d.ts.js')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// Function to fix import statements in a file
function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Define known directories that should resolve to index.js
    const knownDirectories = [
        'tools',
        'types',
        'utils',
        'photo-editor'
    ];
    
    // Define known files that should have .js extension
    const knownFiles = [
        'Canvas',
        'ImageViewer',
        'ZoomPanHandler',
        'AnnotationManager',
        'AnnotationRenderer',
        'ToolManager',
        'ImageComparisonManager',
        'ComparisonViewer',
        'coordinate',
        'image'
    ];
    
    // Fix import statements
    // Match: import ... from './path' or import ... from '../path'
    // But not: import ... from './path.js' (already has extension)
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    
    content = content.replace(importRegex, (match, importPath) => {
        // Skip if it's already a .js file or an absolute path
        if (importPath.endsWith('.js') || importPath.startsWith('http') || importPath.startsWith('data:')) {
            return match;
        }
        
        // Only fix relative imports
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
            modified = true;
            // Special case: if the path doesn't end with a file extension, add .js
            // But if it's a directory path (ends with /), don't add .js
            if (!importPath.endsWith('/')) {
                // Check if this is a directory import (no file extension)
                // For directory imports, we need to add /index.js
                const pathParts = importPath.split('/');
                const lastPart = pathParts[pathParts.length - 1];
                
                if (!lastPart.includes('.')) {
                    // Check if this is a known directory or file
                    const pathParts = importPath.split('/');
                    const lastPartName = pathParts[pathParts.length - 1];
                    
                    if (knownDirectories.includes(lastPartName)) {
                        // It's a known directory, add /index.js
                        return match.replace(importPath, importPath + '/index.js');
                    } else if (knownFiles.includes(lastPartName)) {
                        // It's a known file, add .js
                        return match.replace(importPath, importPath + '.js');
                    } else {
                        // For unknown cases, try to determine based on file existence
                        const possibleFilePath = path.join(path.dirname(filePath), importPath + '.js');
                        const possibleDirPath = path.join(path.dirname(filePath), importPath, 'index.js');
                        
                        if (fs.existsSync(possibleFilePath)) {
                            return match.replace(importPath, importPath + '.js');
                        } else if (fs.existsSync(possibleDirPath)) {
                            return match.replace(importPath, importPath + '/index.js');
                        } else {
                            // Default to .js for unknown cases
                            return match.replace(importPath, importPath + '.js');
                        }
                    }
                } else {
                    // This is a file import, add .js
                    return match.replace(importPath, importPath + '.js');
                }
            }
        }
        
        return match;
    });
    
    // Fix export statements
    // Match: export ... from './path' or export ... from '../path'
    const exportRegex = /export\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    
    content = content.replace(exportRegex, (match, exportPath) => {
        // Skip if it's already a .js file or an absolute path
        if (exportPath.endsWith('.js') || exportPath.startsWith('http') || exportPath.startsWith('data:')) {
            return match;
        }
        
        // Only fix relative exports
        if (exportPath.startsWith('./') || exportPath.startsWith('../')) {
            modified = true;
            
            // Check if this is a directory import
            const pathParts = exportPath.split('/');
            const lastPart = pathParts[pathParts.length - 1];
            
            if (knownDirectories.includes(lastPart)) {
                // It's a known directory, add /index.js
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
        }
}

// Main execution
function main() {
    const distDir = path.join(__dirname, '..', 'dist');
    
    if (!fs.existsSync(distDir)) {
        console.error('Dist directory not found. Please run "npm run build" first.');
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
