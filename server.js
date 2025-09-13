const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    
    if (filePath === './') {
        filePath = './index.html';
    }
    
    // Handle directory requests for ES6 modules
    // If the request ends with a path that looks like a module directory, try index.js
    if (!path.extname(filePath) && !filePath.endsWith('/')) {
        // Check if this might be a module directory request
        const possibleIndexPath = filePath + '/index.js';
        if (fs.existsSync(possibleIndexPath)) {
            filePath = possibleIndexPath;
        } else {
            // Also try adding .js extension for ES6 module imports
            const possibleJsPath = filePath + '.js';
            if (fs.existsSync(possibleJsPath)) {
                filePath = possibleJsPath;
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
    console.log(`[${timestamp}] [SRV] 🚀 CanvasLens development server running on http://localhost:${PORT}`);
    console.log(`[${timestamp}] [SRV] 📁 Serving files from: ${process.cwd()}`);
});
