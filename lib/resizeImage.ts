/**
 * Shrink a photograph in the browser, before it is uploaded.
 *
 * Deliberately client-side. The office uploads over Ghanaian mobile data, and
 * a phone photograph is commonly 4 to 8 MB; resizing on the server would still
 * make them send all of it. Doing it here saves the upload as well as the
 * storage, and the file that lands in the store is the one the public gets.
 *
 * Without this, an aide adding a picture put a multi-megabyte image on the
 * home page for every visitor — on a site whose hero was deliberately cut to
 * about 1 MB for exactly these connections.
 */

const MAX_EDGE = 1600;
const QUALITY = 0.82;

export type ResizeResult = {
  file: File;
  /* For telling the office what happened, in bytes. */
  before: number;
  after: number;
  resized: boolean;
};

function extensionFor(type: string) {
  if (type === 'image/webp') return 'webp';
  if (type === 'image/png') return 'png';
  return 'jpg';
}

/** Does this browser actually encode WebP, or would it silently give us PNG? */
function canEncodeWebp(): boolean {
  try {
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    return c.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

export async function resizeImage(file: File): Promise<ResizeResult> {
  const before = file.size;

  /* Anything already small enough is left alone: re-encoding it would only
     lose quality for no saving. */
  const bitmap = await createImageBitmap(file, {
    /* Phone photographs carry their rotation in EXIF rather than in the
       pixels. Without this they upload sideways. */
    imageOrientation: 'from-image',
  }).catch(() => null);

  if (!bitmap) {
    /* A format the browser will not decode — hand back the original and let
       the server's own type check refuse it. */
    return { file, before, after: before, resized: false };
  }

  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = longest > MAX_EDGE ? MAX_EDGE / longest : 1;

  if (scale === 1 && before < 400_000) {
    bitmap.close?.();
    return { file, before, after: before, resized: false };
  }

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close?.();
    return { file, before, after: before, resized: false };
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const type = canEncodeWebp() ? 'image/webp' : 'image/jpeg';
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, QUALITY),
  );

  /* If the encode failed, or somehow produced something larger, keep what we
     were given rather than making things worse. */
  if (!blob || blob.size >= before) {
    return { file, before, after: before, resized: false };
  }

  const base = file.name.replace(/\.[^.]+$/, '');
  const resizedFile = new File([blob], `${base}.${extensionFor(type)}`, {
    type,
    lastModified: Date.now(),
  });

  return { file: resizedFile, before, after: resizedFile.size, resized: true };
}

/** "4.2 MB" — for telling the office what it just saved. */
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
