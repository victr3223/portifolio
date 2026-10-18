import { mkdir, copyFile, cp, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js']) await copyFile(path.join(root, file), path.join(out, file));
await cp(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });
let count = 0, bytes = 0;
async function walk(dir) { for (const file of await readdir(dir, { withFileTypes: true })) { const p = path.join(dir, file.name); if (file.isDirectory()) await walk(p); else { count++; bytes += (await stat(p)).size; } } }
await walk(out);
console.log(`Build concluído: ${count} arquivos, ${(bytes / 1024 / 1024).toFixed(2)} MB em dist/. Sem dependências de produção ou publicação.`);
