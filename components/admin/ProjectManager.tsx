'use client';

import { useState } from 'react';
import { PROVENANCE_LABEL } from '@/lib/content';
import type { StoredImpact, StoredProject } from '@/lib/store';

/**
 * The development record, editable.
 *
 * This is the part of the site that carries a claim: a badge reading
 * "Delivered" beside a project is the office asserting that the thing stands.
 * So two rules are enforced here rather than left to good intentions.
 *
 * The first is that `provenance` is shown and never edited. A card whose
 * picture is a render is labelled "Render", and no amount of editing the text
 * around it turns the render into a photograph. The office can move a project
 * from Committed to Delivered — that is its own record to keep — but it cannot
 * relabel the image.
 *
 * The second is that the "Projects on the agenda" figure is derived from the
 * list on every render and is therefore not editable. It used to be a number
 * typed into `lib/content.ts` that could, and did, disagree with the projects
 * printed directly beneath it.
 */

const STATUSES = ['Delivered', 'Ongoing', 'In construction', 'Committed'] as const;
const TAGS = ['Sanitation', 'Water', 'Infrastructure', 'Education', 'Environment'] as const;

const input =
  'w-full rounded-xl border border-white/10 bg-ebony px-200 py-100 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold focus:outline-none';
const label = 'block text-xs font-semibold uppercase tracking-[0.12em] text-ivory/60';
const primary =
  'rounded-xl bg-gold px-200 py-100 text-sm font-semibold text-ebony transition-all hover:bg-[#e6c34d] disabled:cursor-not-allowed disabled:opacity-50';
const quiet =
  'rounded-lg border border-white/15 px-100 py-50 text-xs font-semibold text-ivory/70 transition-colors hover:border-gold hover:text-gold disabled:opacity-40';

type Draft = {
  title: string;
  body: string;
  figure: string;
  status: string;
  tag: string;
};

function draftOf(p: StoredProject): Draft {
  return {
    title: p.title,
    body: p.body,
    figure: p.figure ?? '',
    status: p.status,
    tag: p.tag,
  };
}

export function ProjectManager({
  initialProjects,
  initialImpact,
  configured,
}: {
  initialProjects: StoredProject[];
  initialImpact: StoredImpact[];
  configured: boolean;
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [impact, setImpact] = useState(initialImpact);
  const [open, setOpen] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [stats, setStats] = useState<Record<string, { value: string; label: string; note: string }>>(
    Object.fromEntries(
      initialImpact.map((s) => [s.id, { value: String(s.value), label: s.label, note: s.note }]),
    ),
  );
  const [adding, setAdding] = useState(false);
  const [fresh, setFresh] = useState<Draft>({
    title: '',
    body: '',
    figure: '',
    status: 'Committed',
    tag: 'Infrastructure',
  });
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(body: unknown, success: string) {
    setBusy(true);
    setNote(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data.error === 'store_not_connected'
            ? 'The content store is not connected to this deployment yet.'
            : data.error === 'derived_figure'
              ? 'That figure is counted from the list below and cannot be typed in.'
              : data.error === 'title_required'
                ? 'A project needs a title.'
                : 'That did not save. Try again.',
        );
        return false;
      }
      if (data.content) {
        setProjects(data.content.projects);
        setImpact(data.content.impact);
      }
      setNote(success);
      return true;
    } catch {
      setError('Could not reach the server.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  const draft = (p: StoredProject) => drafts[p.id] ?? draftOf(p);
  const edit = (p: StoredProject, patch: Partial<Draft>) =>
    setDrafts((d) => ({ ...d, [p.id]: { ...draft(p), ...patch } }));

  async function save(p: StoredProject) {
    const ok = await send(
      { action: 'set-project', id: p.id, fields: draft(p) },
      `${draft(p).title || p.title} saved. The public page follows within about half a minute.`,
    );
    if (ok) {
      setDrafts((d) => {
        const next = { ...d };
        delete next[p.id];
        return next;
      });
    }
  }

  async function add() {
    const ok = await send({ action: 'add-project', fields: fresh }, 'Project added.');
    if (ok) {
      setFresh({ title: '', body: '', figure: '', status: 'Committed', tag: 'Infrastructure' });
      setAdding(false);
    }
  }

  async function saveStat(id: string) {
    const s = stats[id];
    const value = Number(s.value);
    if (!Number.isFinite(value) || value < 0) {
      setError('That figure is not a number.');
      return;
    }
    await send(
      { action: 'set-impact', id, value, label: s.label, note: s.note },
      'Figure saved.',
    );
  }

  if (!configured) {
    return (
      <p className="rounded-2xl border border-white/10 bg-ebony-raised p-300 text-base text-ivory/65">
        The content store is not connected to this deployment, so the record
        cannot be edited here yet. The site is showing the projects compiled
        into the build.
      </p>
    );
  }

  return (
    <>
      {note && (
        <p role="status" className="mb-300 rounded-xl border border-gold/40 bg-gold/5 p-200 text-sm text-gold">
          {note}
        </p>
      )}
      {error && (
        <p role="alert" className="mb-300 rounded-xl border border-crimson/50 bg-crimson/5 p-200 text-sm text-crimson">
          {error}
        </p>
      )}

      {/* ---- The record itself -------------------------------------- */}
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-200">
          <h2 className="font-display text-3xl font-600 text-ivory">The projects</h2>
          <span className="text-sm text-ivory/50">
            {projects.length} on the agenda ·{' '}
            {projects.filter((p) => p.status === 'Delivered').length} delivered
          </span>
        </div>

        <ul className="mt-300 grid gap-200">
          {projects.map((p, i) => {
            const d = draft(p);
            const dirty = drafts[p.id] !== undefined;
            const isOpen = open === p.id;
            const badge = p.provenance ? PROVENANCE_LABEL[p.provenance] : null;
            return (
              /* min-w-0: a grid item's min-width defaults to auto, so the row
                 takes its width from the truncated (and therefore nowrap)
                 title inside it and refuses to shrink to the track. On a phone
                 that pushed the Edit and Remove buttons past the right edge of
                 main, which clips. */
              <li key={p.id} className="min-w-0 rounded-2xl border border-white/10 bg-ebony-raised">
                <div className="flex min-w-0 flex-wrap items-center gap-200 p-300">
                  <div className="min-w-0 flex-1 basis-[12rem]">
                    <div className="flex flex-wrap items-center gap-100">
                      <span className="rounded-full border border-gold/40 px-100 py-25 text-xs font-semibold text-gold">
                        {p.status}
                      </span>
                      <span className="text-xs text-ivory/45">{p.tag}</span>
                      {badge && (
                        <span className="rounded-full border border-white/15 px-100 py-25 text-xs text-ivory/50">
                          {badge}
                        </span>
                      )}
                      {!p.image && (
                        <span className="rounded-full border border-white/15 px-100 py-25 text-xs text-ivory/40">
                          No photograph
                        </span>
                      )}
                    </div>
                    <h3 className="mt-100 truncate font-display text-xl font-600 text-ivory">
                      {p.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-75">
                    <button
                      type="button"
                      className={quiet}
                      disabled={busy || i === 0}
                      onClick={() => send({ action: 'move-project', id: p.id, direction: 'up' }, 'Order changed.')}
                      aria-label={`Move ${p.title} up`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className={quiet}
                      disabled={busy || i === projects.length - 1}
                      onClick={() => send({ action: 'move-project', id: p.id, direction: 'down' }, 'Order changed.')}
                      aria-label={`Move ${p.title} down`}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className={quiet}
                      onClick={() => setOpen(isOpen ? null : p.id)}
                      aria-expanded={isOpen}
                    >
                      {isOpen ? 'Close' : 'Edit'}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="grid gap-200 border-t border-white/10 p-300">
                    <div className="grid gap-100">
                      <label className={label} htmlFor={`t-${p.id}`}>Title</label>
                      <input
                        id={`t-${p.id}`}
                        className={input}
                        maxLength={90}
                        value={d.title}
                        onChange={(e) => edit(p, { title: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-200 sm:grid-cols-3">
                      <div className="grid gap-100">
                        <label className={label} htmlFor={`s-${p.id}`}>Status</label>
                        <select
                          id={`s-${p.id}`}
                          className={input}
                          value={d.status}
                          onChange={(e) => edit(p, { status: e.target.value })}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-100">
                        <label className={label} htmlFor={`g-${p.id}`}>Heading</label>
                        <select
                          id={`g-${p.id}`}
                          className={input}
                          value={d.tag}
                          onChange={(e) => edit(p, { tag: e.target.value })}
                        >
                          {TAGS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-100">
                        <label className={label} htmlFor={`f-${p.id}`}>Figure</label>
                        <input
                          id={`f-${p.id}`}
                          className={input}
                          maxLength={24}
                          placeholder="20 seaters"
                          value={d.figure}
                          onChange={(e) => edit(p, { figure: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid gap-100">
                      <label className={label} htmlFor={`b-${p.id}`}>Description</label>
                      <textarea
                        id={`b-${p.id}`}
                        rows={4}
                        maxLength={600}
                        className={`${input} resize-y`}
                        value={d.body}
                        onChange={(e) => edit(p, { body: e.target.value })}
                      />
                      <p className="text-xs text-ivory/35">{d.body.length} of 600</p>
                    </div>

                    {badge && (
                      <p className="rounded-xl border border-white/10 bg-ebony p-200 text-xs leading-relaxed text-ivory/50">
                        The picture on this card is labelled <strong className="text-ivory/70">{badge}</strong> on
                        the public page, and that label is not editable here. To
                        replace a render with a photograph of the finished work,
                        send the photograph to the developer so the label changes
                        with the picture.
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-100">
                      <button type="button" className={primary} disabled={busy || !dirty} onClick={() => save(p)}>
                        {dirty ? 'Save changes' : 'Saved'}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          if (!window.confirm(`Remove "${p.title}" from the public record?`)) return;
                          void send({ action: 'delete-project', id: p.id }, 'Project removed.');
                        }}
                        className="ml-auto rounded-lg border border-white/15 px-200 py-50 text-xs font-semibold text-ivory/50 transition-colors hover:border-crimson hover:text-crimson disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {adding ? (
          <div className="mt-300 grid gap-200 rounded-2xl border border-gold/30 bg-ebony-raised p-300">
            <h3 className="font-display text-xl font-600 text-ivory">A new project</h3>
            <div className="grid gap-100">
              <label className={label} htmlFor="new-title">Title</label>
              <input
                id="new-title"
                className={input}
                maxLength={90}
                placeholder="Community water point, Adrobaa Nkwanta"
                value={fresh.title}
                onChange={(e) => setFresh({ ...fresh, title: e.target.value })}
              />
            </div>
            <div className="grid gap-200 sm:grid-cols-3">
              <div className="grid gap-100">
                <label className={label} htmlFor="new-status">Status</label>
                <select
                  id="new-status"
                  className={input}
                  value={fresh.status}
                  onChange={(e) => setFresh({ ...fresh, status: e.target.value })}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid gap-100">
                <label className={label} htmlFor="new-tag">Heading</label>
                <select
                  id="new-tag"
                  className={input}
                  value={fresh.tag}
                  onChange={(e) => setFresh({ ...fresh, tag: e.target.value })}
                >
                  {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid gap-100">
                <label className={label} htmlFor="new-figure">Figure</label>
                <input
                  id="new-figure"
                  className={input}
                  maxLength={24}
                  placeholder="2 boreholes"
                  value={fresh.figure}
                  onChange={(e) => setFresh({ ...fresh, figure: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-100">
              <label className={label} htmlFor="new-body">Description</label>
              <textarea
                id="new-body"
                rows={4}
                maxLength={600}
                className={`${input} resize-y`}
                value={fresh.body}
                onChange={(e) => setFresh({ ...fresh, body: e.target.value })}
              />
            </div>
            <p className="text-xs leading-relaxed text-ivory/45">
              A project added here carries no picture, and the public card shows
              an adinkra in its place until a photograph exists. That is
              deliberate: it says plainly that the work has not been
              photographed rather than dressing it with a stock image.
            </p>
            <div className="flex flex-wrap gap-100">
              <button type="button" className={primary} disabled={busy || !fresh.title.trim()} onClick={add}>
                Add to the record
              </button>
              <button type="button" className={quiet} onClick={() => setAdding(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className={`${primary} mt-300`} onClick={() => setAdding(true)}>
            Add a project
          </button>
        )}
      </section>

      {/* ---- The figures above the record --------------------------- */}
      <section className="mt-600">
        <h2 className="font-display text-3xl font-600 text-ivory">The figures</h2>
        <p className="mt-100 max-w-measure text-sm leading-relaxed text-ivory/55">
          These are the four numbers across the top of the development section.
          The public page states underneath them that they are the office&apos;s
          own figures, confirmed with the traditional council on request — so
          only enter what the council would confirm.
        </p>

        <ul className="mt-300 grid gap-200 sm:grid-cols-2">
          {impact.map((s) => {
            const derived = s.attribution === 'counted';
            const d = stats[s.id];
            return (
              <li key={s.id} className="grid min-w-0 gap-200 rounded-2xl border border-white/10 bg-ebony-raised p-300">
                {derived ? (
                  <>
                    <p className="font-display text-4xl font-600 text-gold">{projects.length}</p>
                    <div>
                      <p className="text-base text-ivory">{s.label}</p>
                      <p className="mt-50 text-xs leading-relaxed text-ivory/45">
                        Counted from the list above every time the page is
                        drawn, so it cannot disagree with the projects printed
                        beneath it. Add or remove a project and this follows.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid gap-100">
                      <label className={label} htmlFor={`v-${s.id}`}>
                        Figure {s.prefix ? `(shown as ${s.prefix}n${s.suffix ?? ''})` : ''}
                      </label>
                      <input
                        id={`v-${s.id}`}
                        className={input}
                        inputMode="decimal"
                        value={d.value}
                        onChange={(e) =>
                          setStats((x) => ({ ...x, [s.id]: { ...x[s.id], value: e.target.value } }))
                        }
                      />
                    </div>
                    <div className="grid gap-100">
                      <label className={label} htmlFor={`l-${s.id}`}>Label</label>
                      <input
                        id={`l-${s.id}`}
                        className={input}
                        maxLength={40}
                        value={d.label}
                        onChange={(e) =>
                          setStats((x) => ({ ...x, [s.id]: { ...x[s.id], label: e.target.value } }))
                        }
                      />
                    </div>
                    <div className="grid gap-100">
                      <label className={label} htmlFor={`n-${s.id}`}>Note beneath it</label>
                      <input
                        id={`n-${s.id}`}
                        className={input}
                        maxLength={80}
                        value={d.note}
                        onChange={(e) =>
                          setStats((x) => ({ ...x, [s.id]: { ...x[s.id], note: e.target.value } }))
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className={primary}
                      disabled={busy}
                      onClick={() => saveStat(s.id)}
                    >
                      Save this figure
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
