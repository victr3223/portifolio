import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.pdf': 'application/pdf', '.ttf': 'font/ttf' };
export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }
      const url = new URL(req.url, 'http://localhost');
      const route = decodeURIComponent(url.pathname);
      const allowed = !route.split('/').includes('..') && (['/', '/index.html', '/styles.css', '/app.js'].includes(route) || route.startsWith('/assets/'));
      const file = path.resolve(root, '.' + (route === '/' ? '/index.html' : route));
      // Colons can address NTFS alternate streams, which are not public assets.
      if (!allowed || !file.startsWith(root + path.sep) || /[\\:]/.test(route) || !(await stat(file)).isFile()) { res.writeHead(404); return res.end('Não encontrado'); }
      const buffer = await readFile(file);
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Content-Length': buffer.length, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
      res.end(req.method === 'HEAD' ? undefined : buffer);
    } catch { res.writeHead(404); res.end('Não encontrado'); }
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4321);
  createServer().listen(port, '127.0.0.1', () => console.log(`Portfólio: http://127.0.0.1:${port}`));
}
