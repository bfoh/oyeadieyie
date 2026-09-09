/**
 * Catch utility classes that silently do nothing.
 *
 * tailwind.config.ts replaces the default spacing scale with the project's own
 * three-digit tokens, and overrides fontWeight the same way. A class outside
 * those scales — `py-150`, `font-600` before the weights were added — is not an
 * error anywhere: Tailwind simply never generates it, the element renders with
 * no padding or at weight 400, and nothing says a word. That has now cost two
 * rounds of "why does this look squashed", so it is checked instead.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SPACING = new Set(
  ['0','25','50','75','100','200','300','400','500','600','700','800','900'],
);
const PREFIXES = [
  'px','py','pt','pr','pb','pl','p',
  'mx','my','mt','mr','mb','ml','m',
  'gap-x','gap-y','gap','space-x','space-y',
];
const RE = new RegExp(
  String.raw`(?<![\w-])(-?(?:${PREFIXES.join('|')}))-(\d{1,3})(?![\w./\[])`,
  'g',
);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === '.git') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(p)) out.push(p);
  }
  return out;
}

const problems = [];
for (const file of walk('.')) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    for (const m of line.matchAll(RE)) {
      if (!SPACING.has(m[2])) problems.push(`${file}:${i + 1}  ${m[0]}`);
    }
  });
}

if (problems.length) {
  console.error('Utility classes outside the project scale, which render as nothing:\n');
  problems.forEach((p) => console.error('  ' + p));
  console.error(`\n${problems.length} found. Use a token from tailwind.config.ts.`);
  process.exit(1);
}
console.log('Spacing utilities all resolve.');
