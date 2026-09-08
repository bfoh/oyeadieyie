'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ASSET_CATEGORIES,
  BRAND_ASSETS,
  BRAND_PHOTOS,
  assetFilename,
  assetsByCategory,
  defaultValues,
  findPhoto,
  type BrandAsset,
} from '@/lib/brandAssets';
import { AssetPreview } from './AssetPreview';
import { WritingAssistant } from './WritingAssistant';

/**
 * The branding hub.
 *
 * A grid of what the office can issue, and an editor that renders the chosen
 * piece live from the office's own details. The file that downloads is
 * exported from the very DOM node on screen, so nothing can drift between the
 * preview and the artwork.
 *
 * Export libraries are imported on demand rather than at module scope: they
 * are the heaviest thing here and most visits never press download.
 */

type Values = Record<string, string>;

/* Keep the editor preview inside the panel without ever cropping it, and
   inside the phone as well: the panel is the smaller of the two on a narrow
   screen, and a sheet that needs sideways scrolling is a sheet the office
   cannot check. */
function editorScale(size: { w: number; h: number }, available: number) {
  return Math.min(1, available / size.w, 620 / size.h);
}

/**
 * The size an asset is drawn at.
 *
 * Type inside the previews is set in absolute pixels against this canonical
 * size, so every place the asset appears scales the whole thing with a
 * transform rather than re-flowing it. That keeps a thumbnail an honest
 * miniature of the sheet instead of a differently proportioned drawing.
 */
function renderSize(asset: BrandAsset) {
  /* Millimetres scale by physical size, so a calling card stays small beside
     an A4 sheet the way it does on a desk. Pixel assets have no physical
     size, so they all draw on one 560px-wide canvas, which is the width the
     type inside them is set against. */
  const w = asset.sheet.unit === 'mm' ? asset.sheet.w * 2.6 : 560;
  return { w: Math.round(w), h: Math.round(w * (asset.sheet.h / asset.sheet.w)) };
}

/* Fit the whole sheet inside a box, never cropping it. */
function fitScale(size: { w: number; h: number }, boxW: number, boxH: number) {
  return Math.min(boxW / size.w, boxH / size.h);
}

const THUMB_H = 190;

function AssetThumb({ asset }: { asset: BrandAsset }) {
  const size = renderSize(asset);
  const scale = fitScale(size, 250, THUMB_H - 24);
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-white/5 bg-black/40"
      style={{ height: THUMB_H }}
    >
      {/* Absolutely positioned, and that is the point: `transform: scale()`
          shrinks a box on screen but leaves its ORIGINAL width in the layout.
          In flow, an A4 sheet drawn at 546px kept a 546px footprint, so every
          card was wider than a phone and the right of it was cut off by the
          admin's overflow guard. Out of flow, the artwork cannot push the
          card at all. */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: size.w,
          height: size.h,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}
      >
        <AssetPreview asset={asset} values={defaultValues(asset)} />
      </div>
    </div>
  );
}

export function BrandingHub() {
  const [category, setCategory] = useState<BrandAsset['category']>('stationery');
  /* Measured, not guessed: the preview panel is a different width on a phone,
     a tablet and a desktop, and the sheet has to fit whichever it is. */
  const [stageWidth, setStageWidth] = useState(560);
  const [openId, setOpenId] = useState<string | null>(null);
  const [values, setValues] = useState<Values>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const asset = useMemo(() => BRAND_ASSETS.find((a) => a.id === openId) ?? null, [openId]);

  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth;
      /* Panel padding on both sides, and the sidebar above lg. */
      const panel = w >= 1024 ? Math.min(560, (w - 248) * 0.55) : w - 96;
      setStageWidth(Math.max(220, panel));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  function open(a: BrandAsset) {
    setValues(defaultValues(a));
    setOpenId(a.id);
    setNote(null);
  }

  async function download(format: 'PNG' | 'PDF') {
    const node = stageRef.current;
    if (!node || !asset) return;
    setBusy(format);
    setNote(null);
    try {
      const { toPng } = await import('html-to-image');
      /* 3x for print: a 300dpi-ish sheet from a screen-sized node. */
      const dataUrl = await toPng(node, {
        pixelRatio: 3,
        cacheBust: true,
        skipFonts: false,
      });

      if (format === 'PNG') {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = assetFilename(asset, 'png');
        a.click();
      } else {
        const { jsPDF } = await import('jspdf');
        const landscape = asset.sheet.w > asset.sheet.h;
        const pdf =
          asset.sheet.unit === 'mm'
            ? new jsPDF({
                orientation: landscape ? 'landscape' : 'portrait',
                unit: 'mm',
                format: [asset.sheet.w, asset.sheet.h],
              })
            : new jsPDF({
                orientation: landscape ? 'landscape' : 'portrait',
                unit: 'px',
                format: [asset.sheet.w, asset.sheet.h],
              });
        pdf.addImage(dataUrl, 'PNG', 0, 0, asset.sheet.w, asset.sheet.h);
        pdf.save(assetFilename(asset, 'pdf'));
      }
      setNote(`${format} saved.`);
    } catch {
      setNote(`That ${format} did not generate. Try again, or use the other format.`);
    } finally {
      setBusy(null);
    }
  }

  /* ---------------- editor ---------------- */
  if (asset) {
    const size = renderSize(asset);
    return (
      <div className="grid gap-400 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-start">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-ebony-raised">
          <header className="flex flex-wrap items-center justify-between gap-200 border-b border-white/10 px-300 py-200">
            <div className="flex items-center gap-200">
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="rounded-lg border border-white/15 px-100 py-50 text-xs font-semibold text-ivory/70 transition-colors hover:border-gold hover:text-gold"
              >
                ← All assets
              </button>
              <span className="text-xs uppercase tracking-[0.18em] text-ivory/40">Preview</span>
            </div>
            <div className="flex items-center gap-100">
              {asset.formats.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => download(f)}
                  disabled={busy !== null}
                  className="rounded-lg bg-gold px-200 py-75 text-xs font-bold uppercase tracking-[0.1em] text-ebony transition-all hover:bg-[#e6c34d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy === f ? 'Rendering…' : `Download ${f}`}
                </button>
              ))}
            </div>
          </header>

          <div className="flex justify-center overflow-auto bg-[#0B0B0A] p-400">
            {/* The exported node. Nothing decorative wraps it, so the file
                contains the artwork and nothing else. */}
            {/* The exported node is rendered at its canonical size and only
                visually scaled, so the file is never limited by the width of
                the panel it was previewed in. */}
            <div
              style={{
                width: size.w * editorScale(size, stageWidth),
                height: size.h * editorScale(size, stageWidth),
                flex: 'none',
              }}
            >
              <div
                ref={stageRef}
                style={{
                  width: size.w,
                  height: size.h,
                  transform: `scale(${editorScale(size, stageWidth)})`,
                  transformOrigin: 'top left',
                  boxShadow: '0 24px 70px rgba(0,0,0,0.6)',
                }}
              >
                <AssetPreview asset={asset} values={values} />
              </div>
            </div>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-100 border-t border-white/10 px-300 py-200 text-xs text-ivory/50">
            <span>{asset.sheet.label}</span>
            {note && <span className="text-gold">{note}</span>}
          </footer>
        </section>

        <section className="rounded-2xl border border-white/10 bg-ebony-raised p-300">
          <h2 className="text-xs uppercase tracking-[0.18em] text-ivory/40">Customise</h2>
          <p className="mt-100 font-display text-2xl font-600 text-ivory">{asset.title}</p>
          <p className="mt-75 text-sm leading-relaxed text-ivory/60">{asset.body}</p>

          <div className="mt-300 grid gap-200">
            {asset.fields.map((field) => {
              const id = `field-${field.key}`;
              const value = values[field.key] ?? '';
              const common =
                'w-full rounded-xl border border-white/10 bg-ebony px-200 py-100 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold focus:outline-none';
              return (
                <div key={field.key}>
                  <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-[0.12em] text-ivory/60">
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={id}
                      rows={field.key === 'items' ? 9 : 4}
                      value={value}
                      maxLength={field.max}
                      placeholder={field.placeholder}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      className={`${common} mt-75 resize-y`}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={id}
                      value={value}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      className={`${common} mt-75`}
                    >
                      {field.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'photo' ? (
                    /* A picker rather than an upload: these are the frames
                       cleared for brand use, cut for the shape each asset
                       needs. "None" is a real option, because a formal sheet
                       often reads better without a face on it. */
                    <div className="mt-100 grid grid-cols-4 gap-75">
                      <button
                        type="button"
                        onClick={() => setValues((v) => ({ ...v, [field.key]: '' }))}
                        aria-pressed={!value}
                        className={[
                          'flex aspect-square items-center justify-center rounded-lg border text-xs font-semibold transition-all',
                          !value ? 'border-gold text-gold' : 'border-white/10 text-ivory/45 hover:border-white/25',
                        ].join(' ')}
                      >
                        None
                      </button>
                      {BRAND_PHOTOS.map((p) => {
                        const selected = value === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            title={p.label}
                            onClick={() => setValues((v) => ({ ...v, [field.key]: p.id }))}
                            aria-pressed={selected}
                            aria-label={p.label}
                            className={[
                              'overflow-hidden rounded-lg border transition-all',
                              selected ? 'border-gold ring-1 ring-gold' : 'border-white/10 hover:border-white/30',
                            ].join(' ')}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.src} alt="" className="aspect-square w-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      id={id}
                      type={field.type === 'date' ? 'date' : 'text'}
                      value={value}
                      maxLength={field.max}
                      placeholder={field.placeholder}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      className={`${common} mt-75`}
                    />
                  )}
                  {(field.type === 'textarea' ||
                    ['headline', 'occasion', 'project', 'note', 'reason'].includes(field.key)) && (
                    <WritingAssistant
                      kind={asset.id}
                      context={asset.fields
                        .filter((f) => f.key !== field.key && values[f.key] && f.type !== 'photo')
                        .map((f) => `${f.label}: ${values[f.key]}`)
                        .join('\n')}
                      placeholder="A borehole was commissioned at Adrobaa on the 14th, funded by the stool"
                      onDraft={(text) => setValues((v) => ({ ...v, [field.key]: text }))}
                    />
                  )}
                  {field.type === 'photo' && value && (
                    <p className="mt-75 text-xs text-ivory/50">{findPhoto(value)?.label}</p>
                  )}
                  {field.help && <p className="mt-50 text-xs leading-relaxed text-ivory/40">{field.help}</p>}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setValues(defaultValues(asset))}
            className="mt-300 w-full rounded-xl border border-white/15 px-200 py-100 text-sm font-semibold text-ivory/70 transition-colors hover:border-gold hover:text-gold"
          >
            Reset to defaults
          </button>
        </section>
      </div>
    );
  }

  /* ---------------- grid ---------------- */
  const shown = assetsByCategory(category);
  const meta = ASSET_CATEGORIES.find((c) => c.id === category)!;

  return (
    <>
      <div
        role="group"
        aria-label="Asset categories"
        className="flex flex-wrap gap-100 rounded-2xl border border-white/10 bg-ebony-raised p-75"
      >
        {ASSET_CATEGORIES.map((c) => {
          const selected = c.id === category;
          const count = assetsByCategory(c.id).length;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              aria-pressed={selected}
              className={[
                'flex items-center gap-100 rounded-xl px-300 py-100 text-sm font-semibold transition-all',
                selected ? 'bg-gold text-ebony' : 'text-ivory/60 hover:text-ivory',
              ].join(' ')}
            >
              {c.label}
              <span
                className={[
                  'rounded-full px-75 py-25 text-xs',
                  selected ? 'bg-ebony/20 text-ebony' : 'bg-white/5 text-ivory/50',
                ].join(' ')}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-400 flex items-center gap-200">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{meta.eyebrow}</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <ul className="mt-300 grid gap-300 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => open(a)}
              className="group flex h-full w-full flex-col rounded-2xl border border-white/10 bg-ebony-raised p-200 text-left transition-all hover:-translate-y-[3px] hover:border-gold/60 hover:shadow-[0_18px_50px_rgba(0,0,0,0.5)]"
            >
              <AssetThumb asset={a} />
              <div className="flex flex-1 flex-col p-100 pt-200">
                <h3 className="font-display text-xl font-600 text-ivory">{a.title}</h3>
                <p className="mt-75 flex-1 text-sm leading-relaxed text-ivory/60">{a.body}</p>
                <div className="mt-200 flex flex-wrap items-center gap-75">
                  {a.formats.map((f) => (
                    <span
                      key={f}
                      className="rounded-full border border-gold/40 px-100 py-25 text-xs font-semibold text-gold"
                    >
                      {f}
                    </span>
                  ))}
                  <span className="ml-auto text-xs text-ivory/35">{a.sheet.label}</span>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
