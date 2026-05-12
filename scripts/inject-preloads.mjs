import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist', 'Frontend-CRCoach', 'browser');
const indexFile = join(distDir, 'index.html');

let html = readFileSync(indexFile, 'utf-8');

const existing = new Set(
  [...html.matchAll(/<link rel="modulepreload" href="([^"]+)">/g)].map(m => m[1])
);

const chunks = readdirSync(distDir)
  .filter(f => f.startsWith('chunk-') && f.endsWith('.js'))
  .filter(f => !existing.has(f))
  .sort();

if (chunks.length === 0) {
  console.log('All chunks already preloaded');
  process.exit(0);
}

const preloads = chunks.map(c => `<link rel="modulepreload" href="${c}">`).join('');
html = html.replace('</body>', `${preloads}</body>`);

writeFileSync(indexFile, html, 'utf-8');
console.log(`Injected ${chunks.length} additional modulepreload hints`);
