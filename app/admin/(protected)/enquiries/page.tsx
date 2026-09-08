import { Enquiries } from '@/components/admin/Enquiries';
import { readContent, storeConfigured } from '@/lib/store';

/* Always current: the office is looking for what has just come in. */
export const dynamic = 'force-dynamic';

export default async function EnquiriesPage() {
  const content = await readContent({ fresh: true });
  const unanswered = content.enquiries.filter((e) => e.status === 'new').length;

  return (
    <>
      <header className="mb-400">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Written to the office
        </p>
        <h1 className="mt-100 font-display text-4xl font-600 leading-tight text-ivory sm:text-5xl">
          {unanswered > 0 ? `${unanswered} waiting on a reply` : 'Enquiries'}
        </h1>
        <p className="mt-200 max-w-measure text-base leading-relaxed text-ivory/65">
          Everything sent through the form on the home page, kept here whether
          or not an email went out. Requests that name a date are checked
          against the ceremonial calendar.
        </p>
      </header>

      {!storeConfigured() && (
        <div className="mb-400 rounded-2xl border border-crimson/40 bg-crimson/5 p-300">
          <p className="text-sm font-semibold text-ivory">The content store is not connected</p>
          <p className="mt-100 text-sm leading-relaxed text-ivory/70">
            Nothing can be recorded until it is. Connect the Blob store on
            Vercel under Storage.
          </p>
        </div>
      )}

      <Enquiries initial={content.enquiries} events={content.events} />
    </>
  );
}
