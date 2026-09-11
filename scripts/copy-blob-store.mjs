#!/usr/bin/env node
/**
 * Copy one Vercel Blob store into another.
 *
 * Blob stores do not travel with a project transfer. They belong to the
 * account that made them, so moving a site to someone else's Vercel means
 * standing up new stores on their side and carrying the contents across, or
 * the site quietly falls back to the content compiled into the build and the
 * office's published work disappears from the page.
 *
 * Usage:
 *
 *   FROM_TOKEN=vercel_blob_rw_… TO_TOKEN=vercel_blob_rw_… \
 *     node scripts/copy-blob-store.mjs            # dry run, lists what would move
 *
 *   FROM_TOKEN=… TO_TOKEN=… node scripts/copy-blob-store.mjs --apply
 *
 *   FROM_TOKEN=… TO_TOKEN=… node scripts/copy-blob-store.mjs --private --apply
 *
 * Dry run is the default on purpose. This writes into a live store, and the
 * first thing anyone should see is a list of what it intends to do.
 *
 * The two stores must have the SAME access level. Access is a property of the
 * store rather than the blob, so a public document cannot be copied into a
 * private store or the reverse — run this once per pair.
 */
import { get, list, put } from '@vercel/blob';

const FROM = process.env.FROM_TOKEN;
const TO = process.env.TO_TOKEN;
const APPLY = process.argv.includes('--apply');
/* Private blobs cannot be fetched by URL without authentication, so the copy
   has to go through the SDK for them. Public ones can simply be fetched. */
const ACCESS = process.argv.includes('--private') ? 'private' : 'public';

if (!FROM || !TO) {
  console.error('Set FROM_TOKEN and TO_TOKEN. See the header of this file.');
  process.exit(1);
}
if (FROM === TO) {
  console.error('FROM_TOKEN and TO_TOKEN are the same store. Refusing.');
  process.exit(1);
}

/* The token carries its store id, which is the only cheap way to show a person
   which two stores they are about to connect. Worth printing: a token pasted
   from the wrong row of a dashboard looks exactly like the right one. */
const storeId = (t) => (t.split('_')[3] ?? 'unknown');

/**
 * Read one blob out of the source store.
 *
 * This used to be a bare `fetch(b.url)` for both access levels, which could
 * never have worked for a private store however the comment above read: a
 * private blob's URL returns 401 to an unauthenticated GET, which is the whole
 * point of it being private. The private side goes through `get()`, where the
 * token is what grants the read, and `useCache: false` so a copy taken right
 * after a write carries the current bytes rather than a cached older set.
 *
 * `list()` does not report contentType — it is not on ListBlobResultBlob — so
 * the type is taken from the read instead. Without this every copied object
 * landed with whatever `put` inferred from the pathname.
 */
async function read(b) {
  if (ACCESS === 'private') {
    const found = await get(b.pathname, {
      access: 'private',
      useCache: false,
      token: FROM,
    });
    if (!found) throw new Error('not found in source store');
    if (!found.stream) throw new Error(`source returned ${found.statusCode}`);
    const body = Buffer.from(await new Response(found.stream).arrayBuffer());
    return { body, contentType: found.blob.contentType || undefined };
  }
  const res = await fetch(b.url);
  if (!res.ok) throw new Error(`source returned ${res.status}`);
  const body = Buffer.from(await res.arrayBuffer());
  return { body, contentType: res.headers.get('content-type') || undefined };
}

const { blobs } = await list({ token: FROM, limit: 1000 });

console.log(`from  store_${storeId(FROM)}  (${blobs.length} objects)`);
console.log(`to    store_${storeId(TO)}`);
console.log(`access ${ACCESS}${APPLY ? '' : '   DRY RUN — nothing will be written'}\n`);

if (!blobs.length) {
  console.log('Nothing to copy.');
  process.exit(0);
}

let moved = 0;
let failed = 0;

for (const b of blobs) {
  const size = `${String(b.size).padStart(7)} bytes`;
  if (!APPLY) {
    console.log(`  would copy  ${b.pathname}  ${size}`);
    continue;
  }
  try {
    const { body, contentType } = await read(b);
    await put(b.pathname, body, {
      access: ACCESS,
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
      token: TO,
    });
    console.log(`  copied      ${b.pathname}  ${size}`);
    moved += 1;
  } catch (err) {
    console.log(`  FAILED      ${b.pathname}  — ${err.message}`);
    failed += 1;
  }
}

if (APPLY) {
  console.log(`\n${moved} copied, ${failed} failed.`);
  /* A partial copy is worse than none, because the destination then looks
     populated. Say so loudly rather than exiting 0 on a half-done job. */
  if (failed) process.exit(1);
} else {
  console.log('\nRe-run with --apply to perform the copy.');
}
