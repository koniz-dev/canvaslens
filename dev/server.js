import http from 'http';
import fs from 'fs';
import path from 'path';

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    
    if (filePath === './') {
        // Auto-discover index.html in subdirectories (recursively)
        function findIndexHtml(dir) {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            
            // First check current directory for index.html
            const currentIndex = path.join(dir, 'index.html');
            if (fs.existsSync(currentIndex)) {
                return currentIndex;
            }
            
            // Then check subdirectories (skip hidden directories)
            for (const item of items) {
                if (item.isDirectory() && !item.name.startsWith('.')) {
                    const subdirPath = path.join(dir, item.name);
                    const found = findIndexHtml(subdirPath);
                    if (found) {
                        return found;
                    }
                }
            }
            
            return null;
        }
        
        const foundIndex = findIndexHtml('.');
        if (foundIndex) {
            filePath = foundIndex;
        } else {
            res.writeHead(404);
            res.end('No index.html found in any subdirectory');
            return;
        }
    }
    
    // Handle asset requests - auto-discover asset directories (recursively)
    if (filePath.startsWith('./assets/') && !fs.existsSync(filePath)) {
        const assetPath = filePath.substring(1); // Remove leading ./
        
        // Recursively search for assets in subdirectories
        function findAsset(dir, targetPath) {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            
            // Check if current directory contains the asset
            const currentAsset = path.join(dir, targetPath);
            if (fs.existsSync(currentAsset)) {
                return currentAsset;
            }
            
            // Search in subdirectories (skip hidden directories)
            for (const item of items) {
                if (item.isDirectory() && !item.name.startsWith('.')) {
                    const subdirPath = path.join(dir, item.name);
                    const found = findAsset(subdirPath, targetPath);
                    if (found) {
                        return found;
                    }
                }
            }
            
            return null;
        }
        
        const foundAsset = findAsset('.', assetPath);
        if (foundAsset) {
            filePath = foundAsset;
        }
    }
    
    // Handle ES6 module imports and directory requests
    if (!path.extname(filePath)) {
        // Handle trailing slash case - remove it and add index.js
        if (filePath.endsWith('/')) {
            const possibleIndexPath = filePath + 'index.js';
            if (fs.existsSync(possibleIndexPath)) {
                filePath = possibleIndexPath;
            }
        } else {
            // No extension and no trailing slash
            // First check if the file exists as-is
            if (!fs.existsSync(filePath)) {
                // Check if it's a directory and has an index.js file
                const possibleIndexPath = filePath + '/index.js';
                if (fs.existsSync(possibleIndexPath)) {
                    filePath = possibleIndexPath;
                } else {
                    // Try adding .js extension for ES6 module imports
                    const possibleJsPath = filePath + '.js';
                    if (fs.existsSync(possibleJsPath)) {
                        filePath = possibleJsPath;
                    }
                }
            } else {
                // File exists, check if it's actually a directory
                const stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    // It's a directory, try to serve index.js
                    const possibleIndexPath = filePath + '/index.js';
                    if (fs.existsSync(possibleIndexPath)) {
                        filePath = possibleIndexPath;
                    }
                }
            }
        }
    }
    
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
        case '.js':
            contentType = 'application/javascript';
            break;
        case '.mjs':
            contentType = 'application/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
        case '.jpeg':
            contentType = 'image/jpeg';
            break;
        case '.gif':
            contentType = 'image/gif';
            break;
        case '.svg':
            contentType = 'image/svg+xml';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            break;
    }
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if(error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found: ' + filePath);
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin, X-Requested-With',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    const timestamp = new Date().toLocaleTimeString('vi-VN', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    console.log(`🚀 Server running at http://localhost:${PORT} [${timestamp}]`);
});
