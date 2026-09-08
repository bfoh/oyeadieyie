import { PROJECTS, isSupplied } from '@/lib/content';
import { readContent } from '@/lib/store';

/**
 * What the office still owes the site.
 *
 * These are the items that cannot be fixed in code: they need a decision, a
 * value or a photograph from the palace. Each says plainly what happens on the
 * public page today while it is missing.
 */
type Item = {
  title: string;
  done: boolean;
  today: string;
  needed: string;
};

export const dynamic = 'force-dynamic';

export default async function ChecklistPage() {
  const content = await readContent({ fresh: true });
  const illustrated = PROJECTS.filter((p) => p.provenance === 'illustration');
  const supplied = (k: keyof typeof content.contact) => isSupplied(content.contact[k]);

  const items: Item[] = [
    {
      title: 'Office email address',
      done: supplied('email'),
      today: 'Every email line is omitted from the footer, the form and the press kit.',
      needed: 'Manage the site → Contact details.',
    },
    {
      title: 'Office telephone',
      done: supplied('phone'),
      today: 'No phone number appears anywhere on the site.',
      needed: 'Manage the site → Contact details.',
    },
    {
      title: 'Press desk address',
      done: supplied('press'),
      today: 'The press panel shows no desk address for newsrooms.',
      needed: 'Manage the site → Contact details.',
    },
    {
      title: 'WhatsApp number',
      done: supplied('whatsapp'),
      today: 'The WhatsApp route beside the form is hidden entirely.',
      needed: 'Manage the site → Contact details. Enter it as 233XXXXXXXXX, not 0XXXXXXXXX.',
    },
    {
      title: 'Engagement inbox',
      done: false,
      today: 'The form tells senders plainly that the message did not send, and offers the direct routes instead.',
      needed: 'Set RESEND_API_KEY and ENGAGE_TO in the deployment environment.',
    },
    {
      title: 'Impact figures confirmed by the council',
      done: false,
      today: 'Investment, reach and community figures are published as stated by the office, and labelled as such.',
      needed: 'Confirm the figures, or replace them with ones the council can produce.',
    },
    {
      title: 'Photographs for every project',
      done: illustrated.length === 0,
      today:
        illustrated.length > 0
          ? `${illustrated.length} cards carry a generated illustration, each labelled: ${illustrated.map((p) => p.title).join(', ')}.`
          : 'Every project card carries a photograph or a render, correctly labelled.',
      needed: 'Send real photographs, then clear the provenance flag on those cards.',
    },
    {
      title: 'First dated update',
      done: content.updates.length > 0,
      today: 'The updates section renders nothing at all, so the site shows no activity since launch.',
      needed: 'Manage the site → Updates: a date, a paragraph, a photograph.',
    },
    {
      title: 'Legal pages reviewed by counsel',
      done: false,
      today: 'Both pages are published and readable, with no note that they are drafts.',
      needed: 'Have them checked against the Data Protection Act, 2012 (Act 843).',
    },
    {
      title: 'The domain',
      done: false,
      today: 'The site is served from nanaoyeadieyie.vercel.app; the canonical URLs point at nanaoyeadieyie.com, which does not resolve.',
      needed: 'Attach the real domain, or set NEXT_PUBLIC_SITE_URL to the address in use.',
    },
  ];

  const outstanding = items.filter((i) => !i.done).length;

  return (
    <>
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Before the next push</p>
        <h1 className="mt-100 font-display text-4xl font-600 leading-tight text-ivory sm:text-5xl">
          What the site is waiting on
        </h1>
        <p className="mt-200 max-w-measure text-base leading-relaxed text-ivory/65">
          {outstanding} of {items.length} items still need something from the
          palace. Nothing here is broken: each one is handled gracefully on the
          public page, and each one would make the site stronger.
        </p>
      </header>

      <ol className="mt-500 grid gap-200">
        {items.map((item, i) => (
          <li
            key={item.title}
            className={[
              'rounded-2xl border p-300',
              item.done ? 'border-white/10 bg-ebony-raised/50' : 'border-white/10 bg-ebony-raised',
            ].join(' ')}
          >
            <div className="flex flex-wrap items-baseline gap-200">
              <span className="font-mono text-xs text-ivory/40">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="flex-1 font-display text-xl font-600 text-ivory">{item.title}</h2>
              <span
                className={[
                  'rounded-full px-100 py-25 text-xs font-semibold',
                  item.done ? 'bg-gold text-ebony' : 'border border-white/20 text-ivory/60',
                ].join(' ')}
              >
                {item.done ? 'Done' : 'Outstanding'}
              </span>
            </div>
            {!item.done && (
              <dl className="mt-200 grid gap-100 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ivory/45">On the site today</dt>
                  <dd className="mt-50 text-sm leading-relaxed text-ivory/70">{item.today}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">What is needed</dt>
                  <dd className="mt-50 text-sm leading-relaxed text-ivory/70">{item.needed}</dd>
                </div>
              </dl>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}
