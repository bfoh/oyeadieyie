import { Calendar } from '@/components/admin/Calendar';
import { readContent } from '@/lib/store';

/* Always fresh: an aide checking a date against the calendar must be looking
   at what the office saved a minute ago, not at a cached copy. */
export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const content = await readContent({ fresh: true });
  return (
    <>
      <header className="mb-400">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          The chief&apos;s year
        </p>
        <h1 className="mt-100 font-display text-4xl font-600 leading-tight text-ivory sm:text-5xl">
          Calendar
        </h1>
        <p className="mt-200 max-w-measure text-base leading-relaxed text-ivory/65">
          Engagements ahead, work already recorded, and the dates the public has
          asked for — on one grid, so a date can be checked before anyone
          replies to anyone.
        </p>
      </header>
      <Calendar content={content} />
    </>
  );
}
