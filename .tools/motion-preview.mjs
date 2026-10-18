// Temporary local QA fixture. Not part of dist/ or the public portfolio server.
import { readFile } from 'node:fs/promises';
import { createServer } from '../scripts/server.mjs';
const server = createServer();
const publicHandler = server.listeners('request')[0];
server.removeAllListeners('request');
const controls = `<script>
const originalMatchMedia = window.matchMedia.bind(window);
const originalReduced = originalMatchMedia('(prefers-reduced-motion: reduce)').matches;
let qaReduced = false;
const qaMotion = new EventTarget();
Object.defineProperty(qaMotion, 'matches', {get:()=>qaReduced});
window.matchMedia = query => query.includes('prefers-reduced-motion') ? qaMotion : originalMatchMedia(query);
document.addEventListener('DOMContentLoaded',()=>{
  const bar = document.createElement('aside');
  bar.id='motion-qa';
  bar.style.cssText='position:fixed;bottom:4px;left:4px;z-index:200;background:#fff;color:#111;border:1px solid #333;padding:6px;font:11px sans-serif;max-width:95vw';
  bar.innerHTML='<span>Cenário QA • modo normal • nativo reduzido: '+originalReduced+' • IO: '+typeof window.IntersectionObserver+'</span> <button style="padding:4px;border:1px solid" id="qa-toggle">Simular movimento reduzido</button>';
  document.body.append(bar);
  document.querySelector('#qa-toggle').addEventListener('click',()=>{
    qaReduced=!qaReduced;
    const css=document.querySelector('link[rel=stylesheet]');
    css.onload=()=>qaMotion.dispatchEvent(new Event('change'));
    css.href='/styles.css?mode='+(qaReduced?'reduce':'normal');
    bar.querySelector('span').textContent='Cenário QA • modo '+(qaReduced?'reduzido':'normal');
    document.querySelector('#qa-toggle').textContent=qaReduced?'Simular movimento normal':'Simular movimento reduzido';
  });
});
</script>`;
server.on('request', async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/') {
    const html = (await readFile(new URL('../index.html', import.meta.url), 'utf8')).replace('<script src="app.js" defer>', controls + '<script src="app.js" defer>');
    res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}); res.end(html);
  } else if (req.method === 'GET' && url.pathname === '/styles.css') {
    const css = (await readFile(new URL('../styles.css', import.meta.url), 'utf8')).replaceAll('@media(prefers-reduced-motion:reduce)', url.searchParams.get('mode') === 'reduce' ? '@media all' : '@media (width:0px)');
    res.writeHead(200, {'Content-Type':'text/css; charset=utf-8','Cache-Control':'no-store'}); res.end(css);
  } else publicHandler(req, res);
});
server.listen(4322, '127.0.0.1', () => console.log('Cenário de movimento: http://127.0.0.1:4322'));
