import Link from 'next/link';
import { PROJECTS, ADINKRA, FAQ, CHIEF, isSupplied } from '@/lib/content';
import { PHOTO_SETS } from '@/lib/presskit';
import { BRAND_ASSETS } from '@/lib/brandAssets';
import { readContent } from '@/lib/store';

/**
 * What the office needs to see on opening the admin.
 *
 * Every figure that the office can change is counted from the STORE, not from
 * the constants compiled into the build. Reading the constants here was the
 * most misleading thing in this admin: the office could post ten updates,
 * upload twenty photographs and fill in every contact field, and this page
 * would still report none of it, then send them to a checklist telling them to
 * edit source code for work they had already done.
 *
 * Only what the office cannot change from here — the adinkra, the FAQ, the
 * brand assets, the cleared press photography — still comes from the build.
 */
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const content = await readContent({ fresh: true });

  const photos = PHOTO_SETS.reduce((n, s) => n + s.shots.length, 0);
  const delivered = PROJECTS.filter((p) => p.status === 'Delivered').length;
  const illustrated = PROJECTS.filter((p) => p.provenance === 'illustration').length;
  const supplied = (k: keyof typeof content.contact) => isSupplied(content.contact[k]);

  const missing = [
    !supplied('email') && 'Office email',
    !supplied('phone') && 'Office telephone',
    !supplied('press') && 'Press desk address',
    !supplied('whatsapp') && 'WhatsApp number',
    content.updates.length === 0 && 'First dated update',
    illustrated > 0 && `${illustrated} project photographs`,
  ].filter(Boolean) as string[];

  const upcoming = content.events.filter(
    (e) => e.date >= new Date().toISOString().slice(0, 10),
  ).length;

  const unanswered = content.enquiries.filter((e) => e.status === 'new').length;

  const stats = [
    {
      label: 'Waiting on a reply',
      value: unanswered,
      note: content.enquiries.length
        ? `${content.enquiries.length} received in all`
        : 'No enquiries yet',
    },
    { label: 'Projects on the agenda', value: PROJECTS.length, note: `${delivered} delivered` },
    {
      label: 'Dated updates',
      value: content.updates.length,
      note: content.updates.length ? 'Published' : 'None yet',
    },
    {
      label: 'Events ahead',
      value: upcoming,
      note: content.events.length ? `${content.events.length} in the calendar` : 'None yet',
    },
    {
      label: 'Gallery frames',
      value: content.gallery.length,
      note: 'The court in session',
    },
    { label: 'Brand assets', value: BRAND_ASSETS.length, note: 'Ready to issue' },
    { label: 'Cleared photographs', value: photos, note: 'In the press kit' },
    { label: 'Adinkra published', value: ADINKRA.length, note: 'With their proverbs' },
    { label: 'Questions answered', value: FAQ.length, note: 'On the public FAQ' },
  ];

  return (
    <>
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          {CHIEF.place}
        </p>
        <h1 className="mt-100 font-display text-4xl font-600 leading-tight text-ivory sm:text-5xl">
          The office at a glance
        </h1>
        <p className="mt-200 max-w-measure text-base leading-relaxed text-ivory/65">
          Counted from the site as it stands right now, so these numbers and the
          public page can never disagree.
        </p>
      </header>

      <dl className="mt-500 grid grid-cols-2 gap-200 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-ebony-raised p-300">
            <dd className="font-display text-4xl font-600 leading-none text-ivory">{s.value}</dd>
            <dt className="mt-200 text-sm font-semibold leading-snug text-ivory/85">{s.label}</dt>
            <dd className="mt-50 text-xs text-ivory/50">{s.note}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-500 grid gap-300 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-ebony-raised p-300">
          <h2 className="font-display text-2xl font-600 text-ivory">Still outstanding</h2>
          {missing.length === 0 ? (
            <p className="mt-200 text-base text-ivory/65">
              Nothing outstanding. The record is complete as published.
            </p>
          ) : (
            <>
              <p className="mt-100 text-sm leading-relaxed text-ivory/60">
                Each of these is currently hidden from the public page rather
                than shown as a blank.
              </p>
              <ul className="mt-200 grid gap-100">
                {missing.map((m) => (
                  <li key={m} className="flex items-start gap-100 text-sm text-ivory/75">
                    <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-crimson" aria-hidden="true" />
                    {m}
                  </li>
                ))}
              </ul>
              <Link
                href="/admin/checklist"
                className="mt-300 inline-flex min-h-[44px] items-center rounded-xl border border-white/15 px-200 text-sm font-semibold text-ivory/80 transition-colors hover:border-gold hover:text-gold"
              >
                Open the checklist
              </Link>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-ebony-raised p-300">
          <h2 className="font-display text-2xl font-600 text-ivory">
            {unanswered > 0 ? 'Somebody is waiting' : 'Issue something'}
          </h2>
          {unanswered > 0 && (
            <>
              <p className="mt-100 text-sm leading-relaxed text-ivory/60">
                {unanswered} {unanswered === 1 ? 'enquiry has' : 'enquiries have'} come
                through the form and {unanswered === 1 ? 'has' : 'have'} not been
                answered.
              </p>
              <Link
                href="/admin/enquiries"
                className="mt-300 inline-flex min-h-[44px] items-center rounded-xl bg-gold px-200 text-sm font-semibold text-ebony transition-all hover:bg-[#e6c34d]"
              >
                Open the enquiries
              </Link>
            </>
          )}
          <p className="mt-100 text-sm leading-relaxed text-ivory/60">
            Letterheads, durbar invitations, citations, site boards and social
            cards, all set in the office&apos;s own identity.
          </p>
          <Link
            href="/admin/branding-hub"
            className={[
              'mt-300 inline-flex min-h-[44px] items-center rounded-xl px-200 text-sm font-semibold transition-all',
              unanswered > 0
                ? 'border border-white/15 text-ivory/80 hover:border-gold hover:text-gold'
                : 'bg-gold text-ebony hover:bg-[#e6c34d]',
            ].join(' ')}
          >
            Open the branding hub
          </Link>
        </section>
      </div>
    </>
  );
}
