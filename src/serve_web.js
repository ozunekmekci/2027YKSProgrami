import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WWW_DIR = path.resolve(__dirname, '../www');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.css': 'text/css; charset=utf-8',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

/**
 * Creates and starts the zero-dependency local static HTTP server.
 * @param {number} [port] - Port number to listen on (default: process.env.PORT or 3000; 0 for ephemeral).
 * @returns {Promise<{ server: http.Server, url: string, port: number }>}
 */
export function startServer(port = (Number(process.env.PORT) || 3000)) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // Handle base URL and safe path resolution
      let pathname = '/';
      try {
        const parsedUrl = new URL(req.url || '/', 'http://localhost');
        pathname = decodeURIComponent(parsedUrl.pathname);
      } catch {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('400 Bad Request');
        return;
      }

      // Prevent directory traversal
      const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
      let filePath = path.resolve(WWW_DIR, '.' + path.sep + safePath);

      // Security check: ensure path stays within WWW_DIR
      if (filePath !== WWW_DIR && !filePath.startsWith(WWW_DIR + path.sep)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('403 Forbidden');
        return;
      }

      // If directory or root, serve index.html
      try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
          filePath = path.join(filePath, 'index.html');
        }
      } catch {
        // Fall through to regular error handling
      }

      fs.readFile(filePath, (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found');
          } else {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('500 Internal Server Error');
          }
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
          'Content-Type': contentType,
          'Service-Worker-Allowed': '/',
          'Access-Control-Allow-Origin': '*',
          'Content-Length': data.length
        });
        res.end(data);
      });
    });

    server.on('error', reject);

    server.listen(port, () => {
      const addr = server.address();
      const actualPort = typeof addr === 'object' && addr ? addr.port : port;
      const url = `http://localhost:${actualPort}`;
      resolve({ server, url, port: actualPort });
    });
  });
}

// CLI entry point
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const initialPort = Number(process.env.PORT) || 3000;
  startServer(initialPort)
    .then(({ url }) => {
      console.log(`🚀 YKS 2027 PWA Dev Server running at: ${url}`);
      console.log(`📦 Serving static assets from: ${WWW_DIR}`);
      console.log(`📱 PWA Service Worker allowed at root /`);
    })
    .catch((err) => {
      console.error('❌ Failed to start server:', err);
      process.exit(1);
    });
}
