import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createServer } from '../scripts/server.mjs';

let server, base;
before(async () => { server = createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); base = `http://127.0.0.1:${server.address().port}`; });
after(async () => { await new Promise(resolve => server.close(resolve)); });

test('site, CSS and JavaScript are served with correct types', async () => {
  for (const [route, type] of [['/', 'text/html'], ['/styles.css', 'text/css'], ['/app.js', 'text/javascript']]) {
    const response = await fetch(base + route); assert.equal(response.status, 200); assert.ok(response.headers.get('content-type').startsWith(type)); assert.ok((await response.text()).length > 100);
  }
});
test('every local HTML/CSS asset resolves, with no network font dependency', async () => {
  const html = await (await fetch(base)).text(); const css = await (await fetch(base + '/styles.css')).text();
  const references = [...html.matchAll(/(?:src|href)="([^"#][^"]*)"/g), ...css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)].map(match => match[1]).filter(value => !/^(https?:|mailto:)/.test(value));
  assert.ok(references.length > 10);
  for (const reference of new Set(references)) { const response = await fetch(new URL(reference, base)); assert.equal(response.status, 200, reference); }
  assert.ok(!css.includes('fonts.googleapis'));
});
test('five certificate PDFs preserve the exact original bytes and thumbnails exist', async () => {
  const manifest = await (await fetch(base + '/assets/asset-manifest.json')).json(); assert.equal(manifest.certificates.length, 5);
  for (const certificate of manifest.certificates) {
    const response = await fetch(`${base}/${certificate.pdf}`); assert.equal(response.status, 200); assert.equal(response.headers.get('content-type'), 'application/pdf');
    const copy = Buffer.from(await response.arrayBuffer()); const original = await readFile(new URL(`../${certificate.original}`, import.meta.url));
    assert.ok(copy.equals(original), certificate.title); assert.equal(createHash('sha256').update(copy).digest('hex'), certificate.sha256); assert.equal(copy.subarray(0, 5).toString(), '%PDF-');
    assert.equal((await fetch(`${base}/${certificate.thumbnail}`)).status, 200);
  }
});
test('resume PDF preserves original, supports HEAD and has the right MIME type', async () => {
  const response = await fetch(`${base}/assets/curriculo-victor.pdf`); const copy = Buffer.from(await response.arrayBuffer()); const original = await readFile(new URL('../curriculo.pdf', import.meta.url));
  assert.ok(copy.equals(original)); assert.equal(response.headers.get('content-type'), 'application/pdf');
  const head = await fetch(`${base}/assets/curriculo-victor.pdf`, { method: 'HEAD' }); assert.equal(head.status, 200); assert.equal((await head.text()).length, 0); assert.equal(Number(head.headers.get('content-length')), copy.length);
});
test('only public site files are served; source, reference and traversal paths are blocked', async () => {
  for (const route of ['/package.json', '/scripts/server.mjs', '/docs/reference/second-0.png', '/.gitignore', '/assets/%2e%2e%2fpackage.json', '/assets/%5c..%5cpackage.json', '/assets/%00.png', '/assets/next-logo.png::$DATA', '/assets/next-logo.png%3AZone.Identifier', '/assets/certificates/logica-programacao-senai.pdf%3AZone.Identifier', '/missing', '/assets/']) {
    assert.equal((await fetch(base + route)).status, 404, route);
  }
});
test('local server rejects writes; it cannot receive a message or publish a comment', async () => {
  for (const method of ['POST', 'PUT', 'DELETE']) { const response = await fetch(base, { method }); assert.equal(response.status, 405); assert.equal(response.headers.get('allow'), 'GET, HEAD'); }
});
test('all internal HTML anchors point to real IDs', async () => {
  const html = await (await fetch(base)).text(); const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(match[1]), `Missing anchor: ${match[1]}`);
});
test('both theme palettes maintain AA contrast for body, helper and input text', async () => {
  const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
  const luminance = hex => { const expanded = hex.length === 4 ? '#' + [...hex.slice(1)].map(char => char + char).join('') : hex; const rgb = expanded.slice(1).match(/../g).map(channel => parseInt(channel, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4); return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722; };
  const contrast = (a, b) => { const values = [luminance(a), luminance(b)].sort((x, y) => y - x); return (values[0] + .05) / (values[1] + .05); };
  for (const selector of [':root{', ':root[data-theme=light]{']) {
    const block = css.slice(css.indexOf(selector)).split('}')[0]; const vars = Object.fromEntries([...block.matchAll(/--([\w-]+):(#(?:\w{6}|\w{3}))(?=;)/g)].map(match => [match[1], match[2]]));
    for (const [foreground, background] of [['fg', 'bg'], ['muted', 'panel2'], ['subtle', 'panel2'], ['subtle', 'field'], ['on-button', 'button']]) assert.ok(contrast(vars[foreground], vars[background]) >= 4.5, `${selector} ${foreground}/${background}`);
  }
});
test('technology vectors have SVG content type', async () => {
  for (const icon of ['html5', 'css3', 'javascript', 'nodejs', 'python', 'git', 'github', 'docker', 'excel']) { const response = await fetch(`${base}/assets/tech/${icon}.svg`); assert.equal(response.status, 200); assert.equal(response.headers.get('content-type'), 'image/svg+xml'); assert.ok((await response.text()).includes('<svg')); }
});
