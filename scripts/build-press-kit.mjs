#!/usr/bin/env node
/**
 * Build public/press/adrobaa-press-kit.zip from lib/presskit.ts.
 *
 * The page and the pack used to be assembled separately, so adding a
 * photograph to the page left the download listing the old count. This reads
 * the same source the page renders from, so the two cannot disagree: run it
 * whenever the photography or the biography changes.
 *
 *   node scripts/build-press-kit.mjs
 *
 * It prints the file count and size to paste into KIT in lib/presskit.ts,
 * and fails loudly if a listed photograph is missing from public/img.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, copyFileSync, writeFileSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'lib/presskit.ts'), 'utf8');

/** Pull a single-quoted or backticked export out of the source. */
function readExport(name) {
  const m =
    source.match(new RegExp(`export const ${name} =\\s*\`([\\s\\S]*?)\`;`)) ??
    source.match(new RegExp(`export const ${name} =\\s*"([\\s\\S]*?)";`)) ??
    source.match(new RegExp(`export const ${name} =\\s*'([\\s\\S]*?)';`));
  if (!m) throw new Error(`Could not read ${name} from lib/presskit.ts`);
  return m[1].replace(/\\'/g, "'").replace(/\\n/g, '\n');
}

/* Every shot in every set, in page order. */
const shots = [...source.matchAll(
  /src:\s*'([^']+)',\s*\n\s*name:\s*'([^']+)',\s*\n\s*alt:\s*'([^']+)',(?:\s*\n\s*note:\s*'([^']+)',)?/g,
)].map(([, src, name, alt, note]) => ({ src, name, alt, note }));

if (!shots.length) throw new Error('No photographs found in lib/presskit.ts');

const address = [...source.matchAll(/label:\s*'([^']+)',\s*\n?\s*value:\s*'([^']+)'/g)]
  .map(([, label, value]) => `  ${label}: ${value}`)
  .join('\n');

const terms = [...source.matchAll(/^\s{2}'([^']+)',$/gm)]
  .map(([, t]) => t)
  .filter((t) => t.endsWith('.'))
  .map((t) => `  - ${t}`)
  .join('\n');

const stage = mkdtempSync(join(tmpdir(), 'press-kit-'));
const photos = join(stage, 'photographs');
mkdirSync(photos);

const missing = [];
for (const shot of shots) {
  const from = join(root, 'public', shot.src.replace(/^\//, ''));
  if (!existsSync(from)) {
    missing.push(shot.src);
    continue;
  }
  copyFileSync(from, join(photos, shot.name));
}

if (missing.length) {
  rmSync(stage, { recursive: true, force: true });
  console.error('Missing photographs listed in lib/presskit.ts:');
  missing.forEach((m) => console.error(`  ${m}`));
  process.exit(1);
}

const manifest = shots
  .map((s) => `  ${s.name}\n    ${s.alt}${s.note ? `\n    NOTE: ${s.note}` : ''}`)
  .join('\n\n');

writeFileSync(
  join(stage, 'README.txt'),
  `PRESS KIT
Office of the Nkosuo Hene of Adrobaa
Tano North Municipal, Ahafo Region, Ghana

FORMS OF ADDRESS
${address}

${readExport('ADDRESS_NOTE')}

BIOGRAPHY, SHORT
${readExport('BIO_SHORT')}

BIOGRAPHY, LONG
${readExport('BIO_LONG')}

TERMS OF USE
${terms}

PHOTOGRAPHS (${shots.length})
${manifest}
`,
  'utf8',
);

const out = join(root, 'public/press/adrobaa-press-kit.zip');
mkdirSync(dirname(out), { recursive: true });
rmSync(out, { force: true });
execFileSync('zip', ['-r', '-q', out, '.'], { cwd: stage });
rmSync(stage, { recursive: true, force: true });

const mb = (statSync(out).size / (1024 * 1024)).toFixed(1);
console.log(`Built ${out}`);
console.log(`Update KIT in lib/presskit.ts to:`);
console.log(`  size: '${mb} MB'`);
console.log(`  count: '${shots.length} images'`);
