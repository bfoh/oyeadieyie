import { ContentManager } from '@/components/admin/ContentManager';
import { StoredFiles } from '@/components/admin/StoredFiles';
import { readContent, storeConfigured } from '@/lib/store';

/* Always fresh: the office needs to see what it just changed. */
export const dynamic = 'force-dynamic';

export default async function ContentPage() {
  /* The office must see what it just changed, not a cached copy. */
  const content = await readContent({ fresh: true });
  return (
    <>
      <header className="mb-400">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">The noticeboard</p>
        <h1 className="mt-100 font-display text-4xl font-600 leading-tight text-ivory sm:text-5xl">
          Manage the site
        </h1>
        <p className="mt-200 max-w-measure text-base leading-relaxed text-ivory/65">
          Updates, events, photographs and the office&apos;s contact details.
          Changes appear on the public site within about half a minute.
        </p>
      </header>
      <ContentManager initial={content} configured={storeConfigured()} />
      {storeConfigured() && <StoredFiles />}
    </>
  );
}
