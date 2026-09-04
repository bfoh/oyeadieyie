'use client';

import { useState } from 'react';
import { ArrowRight, WarningCircle } from '@phosphor-icons/react/dist/ssr';
import { ENGAGE_ROUTES, CONTACT } from '@/lib/content';
import { Reveal } from './Reveal';

type Errors = Partial<Record<'name' | 'email' | 'organisation' | 'detail', string>>;
type Status = 'idle' | 'loading' | 'sent';

export function Engage() {
  const [route, setRoute] = useState(ENGAGE_ROUTES[0].id);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');

  function validate(form: HTMLFormElement): Errors {
    const data = new FormData(form);
    const next: Errors = {};

    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const organisation = String(data.get('organisation') ?? '').trim();
    const detail = String(data.get('detail') ?? '').trim();

    if (name.length < 2) next.name = 'Please give the name we should address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      next.email = 'That email address does not look complete.';
    if (organisation.length < 2)
      next.organisation = 'Tell us who the request comes from.';
    if (detail.length < 12)
      next.detail = 'A sentence or two on the date, place and format, please.';

    return next;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      /* Focus the first field in source order. Reading the DOM here would race
         the re render, so drive it from the error keys instead. */
      const order = ['name', 'email', 'organisation', 'detail'] as const;
      const first = order.find((k) => found[k]);
      if (first) form.querySelector<HTMLElement>(`#${first}`)?.focus();
      return;
    }

    setStatus('loading');
    /* No endpoint is wired yet. Point this at the palace inbox or a form
       service and remove the timeout. */
    await new Promise((r) => setTimeout(r, 900));
    setStatus('sent');
  }

  const field =
    'w-full rounded-xl border bg-ebony px-200 py-100 text-base text-ivory placeholder:text-ivory/30 transition-all duration-700 ease-fluid';

  return (
    <section
      id="engage"
      data-choreo className="relative border-t border-ebony-line bg-ebony-raised/45 px-300 py-700 sm:px-500 sm:py-800 lg:px-800"
    >

      <div className="relative mx-auto w-full max-w-[1280px]">
        <Reveal>
          <div className="flex items-center gap-100">
            <span className="rule-gold w-[40px] shrink-0" aria-hidden="true" />
            <p data-choreo-label className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Engage and support
            </p>
          </div>
          <h2 data-choreo-heading className="mt-100 max-w-measure font-display text-4xl font-600 leading-[1.1] text-ivory sm:mt-200 sm:text-5xl">
            Write to the office
          </h2>
          <p data-choreo-lead className="mt-200 max-w-measure text-base leading-relaxed text-ivory/70">
            Appearances are confirmed against the traditional calendar. Allow six
            weeks for international engagements and three within Ghana.
          </p>
        </Reveal>

        <div className="mt-600 grid gap-500 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
          {/* Routes */}
          <Reveal>
            <ul className="grid gap-200">
              {ENGAGE_ROUTES.map((r) => {
                const selected = route === r.id;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setRoute(r.id)}
                      aria-pressed={selected}
                      className={[
                        'w-full rounded-2xl border p-300 text-left transition-all duration-700 ease-fluid active:scale-[0.99]',
                        selected
                          ? 'border-gold bg-ebony'
                          : 'border-ebony-line bg-ebony/60 hover:border-gold-dim',
                      ].join(' ')}
                    >
                      <div className="flex items-center justify-between gap-200">
                        <h3 className="font-display text-xl font-600 text-ivory">
                          {r.title}
                        </h3>
                        {r.primary && (
                          <span className="shrink-0 rounded-full bg-gold px-100 py-25 text-xs font-semibold text-ebony">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="mt-75 text-sm leading-relaxed text-ivory/60">
                        {r.body}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          {/* Form */}
          <Reveal delay={120}>
            <div className="rounded-2xl border border-ebony-line bg-ebony p-400">
              {status === 'sent' ? (
                <div role="status" className="py-500 text-center">
                  <h3 className="font-display text-3xl font-600 text-ivory">
                    Your request has reached the office
                  </h3>
                  <p className="mx-auto mt-200 max-w-measure text-base leading-relaxed text-ivory/65">
                    The palace reviews availability against the traditional
                    calendar and replies within five working days.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-400 rounded-xl border border-white/20 px-200 py-100 text-base font-semibold text-ivory transition-all duration-700 ease-fluid hover:border-gold hover:text-gold active:scale-[0.98]"
                  >
                    Send another request
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate>
                  <div className="grid gap-300 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-ivory"
                      >
                        Your name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'err-name' : undefined}
                        className={`${field} mt-75 ${
                          errors.name
                            ? 'border-crimson'
                            : 'border-ebony-line focus:border-gold'
                        }`}
                        placeholder="Akosua Mensah"
                      />
                      {errors.name && (
                        <p
                          id="err-name"
                          className="mt-75 flex items-center gap-50 text-sm text-crimson"
                        >
                          <WarningCircle size={15} weight="fill" aria-hidden="true" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-1">
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-ivory"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'err-email' : undefined}
                        className={`${field} mt-75 ${
                          errors.email
                            ? 'border-crimson'
                            : 'border-ebony-line focus:border-gold'
                        }`}
                        placeholder="name@newsroom.com"
                      />
                      {errors.email && (
                        <p
                          id="err-email"
                          className="mt-75 flex items-center gap-50 text-sm text-crimson"
                        >
                          <WarningCircle size={15} weight="fill" aria-hidden="true" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="organisation"
                        className="block text-sm font-semibold text-ivory"
                      >
                        Organisation
                      </label>
                      <input
                        id="organisation"
                        name="organisation"
                        type="text"
                        autoComplete="organization"
                        aria-invalid={Boolean(errors.organisation)}
                        aria-describedby={
                          errors.organisation ? 'err-organisation' : undefined
                        }
                        className={`${field} mt-75 ${
                          errors.organisation
                            ? 'border-crimson'
                            : 'border-ebony-line focus:border-gold'
                        }`}
                        placeholder="Ahafo Business Forum"
                      />
                      {errors.organisation && (
                        <p
                          id="err-organisation"
                          className="mt-75 flex items-center gap-50 text-sm text-crimson"
                        >
                          <WarningCircle size={15} weight="fill" aria-hidden="true" />
                          {errors.organisation}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="detail"
                        className="block text-sm font-semibold text-ivory"
                      >
                        Date, place and format
                      </label>
                      <textarea
                        id="detail"
                        name="detail"
                        rows={4}
                        aria-invalid={Boolean(errors.detail)}
                        aria-describedby={errors.detail ? 'err-detail' : undefined}
                        className={`${field} mt-75 resize-y ${
                          errors.detail
                            ? 'border-crimson'
                            : 'border-ebony-line focus:border-gold'
                        }`}
                        placeholder="Keynote at a mining and minerals forum in Sunyani, second week of March. Regalia preferred for the opening procession."
                      />
                      {errors.detail && (
                        <p
                          id="err-detail"
                          className="mt-75 flex items-center gap-50 text-sm text-crimson"
                        >
                          <WarningCircle size={15} weight="fill" aria-hidden="true" />
                          {errors.detail}
                        </p>
                      )}
                    </div>
                  </div>

                  <input type="hidden" name="route" value={route} />

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="group mt-400 inline-flex w-full items-center justify-center gap-75 rounded-xl bg-gold px-200 py-100 text-base font-semibold text-ebony transition-all duration-700 ease-fluid hover:bg-[#e6c34d] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {status === 'loading' ? 'Sending' : 'Send to the office'}
                    {status !== 'loading' && (
                      <ArrowRight
                        size={16}
                        weight="bold"
                        aria-hidden="true"
                        className="transition-transform duration-700 ease-fluid group-hover:translate-x-[3px]"
                      />
                    )}
                  </button>

                  <p className="mt-200 text-xs leading-relaxed text-ivory/40">
                    {CONTACT.office}
                    <br />
                    {CONTACT.email} · {CONTACT.phone}
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
