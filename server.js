const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = req.url === '/' ? 'HeroPage.html' : req.url.substring(1); // Serve HeroPage.html by default

    // Resolve full path
    filePath = path.join(__dirname, filePath);

    // Get file extension
    let ext = path.extname(filePath);

    // Define Content-Type based on file type
    let contentType = 'text/html'; // Default to HTML
    switch (ext) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
        case '.jpeg':
            contentType = 'image/jpeg';
            break;
        case '.svg':
            contentType = 'image/svg+xml';
            break;
        default:
            contentType = 'text/html';
    }

    // Check if file exists before reading
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Error: File Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

// Start the server
server.listen(8080, () => {
    console.log('Server running at http://localhost:8080/');
});
