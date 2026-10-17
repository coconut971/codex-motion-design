import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.mp4': 'video/mp4' };

export async function serve({ root = repositoryRoot, port = 4173 } = {}) {
  const base = path.resolve(root);
  const realBase = await realpath(base);
  const outside = (directory, target) => {
    const relative = path.relative(directory, target);
    return relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative);
  };
  const server = http.createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed'); return; }
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const target = path.resolve(base, `.${pathname === '/' ? '/examples/signal.html' : pathname}`);
      if (pathname.split(/[\\/]/).some(segment => segment.startsWith('.')) || outside(base, target)) {
        response.writeHead(403).end('Forbidden'); return;
      }
      const resolved = await realpath(target);
      if (outside(realBase, resolved)) { response.writeHead(403).end('Forbidden'); return; }
      const info = await stat(target);
      if (!info.isFile()) { response.writeHead(404).end('Not found'); return; }
      response.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Content-Length': info.size, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      if (request.method === 'HEAD') { response.end(); return; }
      const stream = createReadStream(target);
      stream.on('error', () => response.destroy());
      stream.pipe(response);
    } catch { response.writeHead(404).end('Not found'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return { server, url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = process.argv.slice(2).find(value => value.startsWith('--port='));
  const port = Number(arg?.split('=')[1] ?? process.argv[2] ?? 4173);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Port must be an integer from 0 to 65535.');
  const local = await serve({ port });
  console.log(`Studio: ${local.url}/examples/signal.html`);
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { await local.close(); process.exit(0); });
}
