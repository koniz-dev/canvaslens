const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    
    if (filePath === './') {
        filePath = './index.html';
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
                console.log(`404: ${filePath}`);
                res.writeHead(404);
                res.end('File not found: ' + filePath);
            } else {
                console.log(`500: ${filePath} - ${error.code}`);
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/`);
    console.log(`📁 Serving files from: ${process.cwd()}`);
});
