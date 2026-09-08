'use client';

import { GLYPHS } from '../adinkraGlyphs';
import { BRAND, type BrandAsset } from '@/lib/brandAssets';

/**
 * The artwork itself.
 *
 * Every asset is drawn in the browser from the office's real details and the
 * site's own palette, then exported from this same DOM, so what the office
 * downloads is exactly what it approved on screen.
 *
 * Paper assets print dark ink on cream, not the site's ebony: a letterhead
 * that arrives as a solid black sheet is a letterhead nobody can afford to
 * print. Screen assets keep the ebony and gold of the site.
 */

const INK = '#17150F';
const CREAM = '#FBF9F3';
const GOLD = '#9A7B1F';
const GOLD_BRIGHT = '#D4AF37';
const EBONY = '#111111';
const IVORY = '#F9F8F3';

type Values = Record<string, string>;

function Glyph({
  id,
  size,
  color,
  opacity = 1,
}: {
  id: string;
  size: number;
  color: string;
  opacity?: number;
}) {
  const g = GLYPHS[id];
  if (!g) return null;
  return (
    <svg
      viewBox={g.viewBox}
      width={size}
      height={size}
      style={{ color, opacity, display: 'block' }}
      aria-hidden="true"
    >
      {g.el}
    </svg>
  );
}

/* The crest used across the office's paper: the lozenge from the site nav. */
function Crest({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path d="M12 2.5 20 12l-8 9.5L4 12 12 2.5Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12 6.8 16.6 12 12 17.2 7.4 12 12 6.8Z" stroke={color} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M9.4 12h5.2" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function Wordmark({
  size = 13,
  color = INK,
  text = BRAND.chief,
}: {
  size?: number;
  color?: string;
  text?: string;
}) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-wordmark), Garamond, Georgia, serif',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        fontSize: size,
        lineHeight: 1,
        color,
      }}
    >
      {text}
    </span>
  );
}

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

/* A quiet band of adinkra, the cloth motif carried onto paper. */
function GlyphBand({
  color,
  opacity,
  count = 9,
  size = 16,
}: {
  color: string;
  opacity: number;
  count?: number;
  size?: number;
}) {
  const keys = Object.keys(GLYPHS);
  return (
    <div style={{ display: 'flex', gap: size * 0.85, alignItems: 'center' }}>
      {Array.from({ length: count }).map((_, i) => (
        <Glyph key={i} id={keys[i % keys.length]} size={size} color={color} opacity={opacity} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------
   Individual assets
--------------------------------------------------------------- */

function Letterhead({ v }: { v: Values }) {
  const body = (v.bodyText ?? '').trim();
  return (
    <div style={{ ...sheet(CREAM, INK), padding: '44px 52px', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'flex-start', gap: 16, borderBottom: `1px solid ${GOLD}`, paddingBottom: 20 }}>
        <Crest size={40} color={GOLD} />
        <div style={{ flex: 1 }}>
          <Wordmark size={15} />
          <div style={{ marginTop: 7, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: GOLD }}>
            {BRAND.title}, the {BRAND.titleMeaning}
          </div>
          <div style={{ marginTop: 4, fontSize: 9.5, color: '#5C5648' }}>{BRAND.place} · {BRAND.region}</div>
        </div>
      </header>

      <div style={{ flex: 1, paddingTop: 26, fontSize: 11, lineHeight: 1.75, color: '#2A2620' }}>
        {v.date && <div style={{ marginBottom: 16, color: '#5C5648' }}>{formatDate(v.date)}</div>}
        {v.recipient && <div style={{ marginBottom: 14, fontWeight: 600 }}>{v.recipient}</div>}
        {v.subject && (
          <div style={{ marginBottom: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10.5 }}>
            {v.subject}
          </div>
        )}
        {body ? (
          <div style={{ whiteSpace: 'pre-wrap' }}>{body}</div>
        ) : (
          <div style={{ opacity: 0.22, fontStyle: 'italic' }}>
            {/* Deliberately empty: most offices want clean paper to print or write on. */}
            Blank sheet, ready for the letter.
          </div>
        )}
      </div>

      <footer style={{ borderTop: `1px solid #DED6C4`, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div style={{ fontSize: 8.5, lineHeight: 1.6, color: '#6B6455' }}>
          <div>{BRAND.office}</div>
          <div>{[BRAND.email, BRAND.phone].filter(Boolean).join(' · ')}</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 8.5, fontStyle: 'italic', color: GOLD, maxWidth: 150 }}>{BRAND.motto}</div>
      </footer>
    </div>
  );
}

function CallingCard({ v }: { v: Values }) {
  const reverse = v.side === 'Reverse';
  if (reverse) {
    return (
      <div style={{ ...sheet(EBONY, IVORY), padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Crest size={26} color={GOLD_BRIGHT} />
          <div style={{ textAlign: 'right', fontSize: 7, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(249,248,243,0.5)' }}>
            {BRAND.company}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, lineHeight: 1.7, color: 'rgba(249,248,243,0.75)' }}>
            {BRAND.office}
          </div>
          {(BRAND.email || BRAND.phone) && (
            <div style={{ marginTop: 6, fontSize: 8.5, color: GOLD_BRIGHT }}>
              {[BRAND.email, BRAND.phone].filter(Boolean).join('  ·  ')}
            </div>
          )}
        </div>
        <GlyphBand color={GOLD_BRIGHT} opacity={0.22} count={7} size={12} />
      </div>
    );
  }
  return (
    <div style={{ ...sheet(CREAM, INK), padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -18, bottom: -18, opacity: 0.06 }}>
        <Glyph id="adinkrahene" size={120} color={GOLD} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <Crest size={22} color={GOLD} />
        <span style={{ height: 14, width: 1, background: '#D8CFBB' }} />
        <span style={{ fontSize: 7.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD }}>
          {BRAND.place}
        </span>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 15, lineHeight: 1.2, fontWeight: 600 }}>
          {v.name || BRAND.chief}
        </div>
        <div style={{ marginTop: 5, fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: GOLD }}>
          {v.style || BRAND.title}
        </div>
        <div style={{ marginTop: 7, fontSize: 8, color: '#6B6455' }}>{v.line}</div>
      </div>
    </div>
  );
}

function ComplimentSlip({ v }: { v: Values }) {
  return (
    <div style={{ ...sheet(CREAM, INK), padding: '30px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Crest size={28} color={GOLD} />
        <Wordmark size={11} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 20, fontStyle: 'italic', color: INK }}>
          {v.note || 'With the compliments of the Nkosuo Hene'}
        </div>
        <div style={{ margin: '12px auto 0', width: 70, height: 1, background: GOLD }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 8, color: '#6B6455' }}>
        <span>{BRAND.office}</span>
        <span style={{ color: GOLD, fontStyle: 'italic' }}>{BRAND.motto}</span>
      </div>
    </div>
  );
}

function Envelope({ v }: { v: Values }) {
  return (
    <div style={{ ...sheet(CREAM, INK), padding: '26px 32px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Crest size={30} color={GOLD} />
        <div>
          <Wordmark size={10.5} />
          <div style={{ marginTop: 5, fontSize: 8, lineHeight: 1.6, color: '#6B6455', maxWidth: 210 }}>
            {BRAND.office}
          </div>
        </div>
      </div>
      {v.addressee ? (
        <div style={{ position: 'absolute', left: '42%', top: '52%', fontSize: 11, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: INK }}>
          {v.addressee}
        </div>
      ) : (
        <div style={{ position: 'absolute', left: '42%', top: '55%', right: 34 }}>
          <div style={{ height: 1, background: '#E2DAC8', marginBottom: 14 }} />
          <div style={{ height: 1, background: '#E2DAC8', marginBottom: 14 }} />
          <div style={{ height: 1, background: '#E2DAC8' }} />
        </div>
      )}
    </div>
  );
}

function DurbarInvitation({ v }: { v: Values }) {
  return (
    <div style={{ ...sheet(EBONY, IVORY), padding: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 12, border: `1px solid ${GOLD_BRIGHT}`, opacity: 0.35, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: '50%', top: 200, transform: 'translateX(-50%)', opacity: 0.05 }}>
        <Glyph id="gyenyame" size={230} color={GOLD_BRIGHT} />
      </div>

      <div style={{ position: 'relative', paddingTop: 12 }}>
        <Crest size={34} color={GOLD_BRIGHT} />
      </div>
      <div style={{ position: 'relative', marginTop: 12, fontSize: 8, letterSpacing: '0.24em', textTransform: 'uppercase', color: GOLD_BRIGHT }}>
        The stool of Adrobaa
      </div>
      <div style={{ position: 'relative', marginTop: 18, fontSize: 10, color: 'rgba(249,248,243,0.72)' }}>
        {BRAND.chief}, {BRAND.title},
        <br />
        requests the pleasure of the company of
      </div>
      <div style={{ position: 'relative', marginTop: 16, minHeight: 30, borderBottom: `1px solid rgba(212,175,55,0.4)`, paddingBottom: 6, width: '78%' }}>
        <span style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 17, color: IVORY }}>
          {v.guest || ' '}
        </span>
      </div>
      <div style={{ position: 'relative', marginTop: 18, fontSize: 10, color: 'rgba(249,248,243,0.72)' }}>at the</div>
      <div style={{ position: 'relative', marginTop: 8, fontFamily: 'var(--font-display), Georgia, serif', fontSize: 22, lineHeight: 1.2, color: GOLD_BRIGHT }}>
        {v.occasion || 'Durbar of Chiefs'}
      </div>

      <div style={{ position: 'relative', marginTop: 'auto', width: '100%', paddingTop: 20 }}>
        <div style={{ display: 'grid', gap: 7, fontSize: 9.5, color: 'rgba(249,248,243,0.8)' }}>
          {v.date && <div>{formatDate(v.date)}</div>}
          {v.time && <div>{v.time}</div>}
          {v.venue && <div>{v.venue}</div>}
          {v.dress && (
            <div style={{ marginTop: 6, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: GOLD_BRIGHT }}>
              Dress: {v.dress}
            </div>
          )}
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
          <GlyphBand color={GOLD_BRIGHT} opacity={0.4} count={5} size={11} />
        </div>
      </div>
    </div>
  );
}

function Citation({ v }: { v: Values }) {
  return (
    <div style={{ ...sheet(CREAM, INK), padding: 34, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 16, border: `2px solid ${GOLD}`, opacity: 0.45 }} />
      <div style={{ position: 'absolute', inset: 22, border: `1px solid ${GOLD}`, opacity: 0.3 }} />
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 8 }}>
        <Crest size={38} color={GOLD} />
        <div style={{ marginTop: 10, fontSize: 8, letterSpacing: '0.26em', textTransform: 'uppercase', color: GOLD }}>
          Office of the {BRAND.title}
        </div>
        <div style={{ marginTop: 14, fontFamily: 'var(--font-display), Georgia, serif', fontSize: 30, letterSpacing: '0.04em' }}>
          Citation
        </div>
        <div style={{ marginTop: 16, fontSize: 10, color: '#5C5648' }}>presented to</div>
        <div style={{ marginTop: 8, fontFamily: 'var(--font-display), Georgia, serif', fontSize: 24, color: INK }}>
          {v.honouree || ' '}
        </div>
        <div style={{ marginTop: 14, fontSize: 10.5, lineHeight: 1.8, maxWidth: '74%', color: '#3A352C' }}>
          in recognition of {v.reason || ' '}
        </div>
        <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 20 }}>
          <div style={{ textAlign: 'left', fontSize: 8.5, color: '#6B6455' }}>
            <div style={{ width: 120, borderTop: `1px solid ${INK}`, paddingTop: 5 }}>{BRAND.shortName}</div>
            <div style={{ marginTop: 2, color: GOLD }}>{BRAND.title}</div>
          </div>
          <div style={{ fontSize: 8.5, color: '#6B6455' }}>{formatDate(v.date)}</div>
        </div>
      </div>
    </div>
  );
}

function ProjectBoard({ v }: { v: Values }) {
  return (
    <div style={{ ...sheet(EBONY, IVORY), display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: GOLD_BRIGHT, color: EBONY, padding: '18px 26px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <Crest size={34} color={EBONY} />
        <div>
          <div style={{ fontFamily: 'var(--font-wordmark), Garamond, serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 13 }}>
            {BRAND.chief}
          </div>
          <div style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>
            {BRAND.title}, the {BRAND.titleMeaning}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '26px 26px 20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD_BRIGHT }}>
          Development project
        </div>
        <div style={{ marginTop: 10, fontFamily: 'var(--font-display), Georgia, serif', fontSize: 27, lineHeight: 1.12, fontWeight: 600 }}>
          {v.project}
        </div>
        <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, borderTop: '1px solid rgba(249,248,243,0.16)', paddingTop: 16 }}>
          {[
            ['Location', v.location],
            ['Status', v.status],
            ['Funded by', v.funder],
            ['Expected completion', v.completion],
          ]
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label as string}>
                <div style={{ fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: GOLD_BRIGHT }}>{label}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: IVORY }}>{value}</div>
              </div>
            ))}
        </div>
        <div style={{ marginTop: 16, fontSize: 10, fontStyle: 'italic', color: 'rgba(249,248,243,0.6)' }}>
          {BRAND.motto}
        </div>
      </div>
    </div>
  );
}

function Programme({ v }: { v: Values }) {
  const items = (v.items ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  return (
    <div style={{ ...sheet(CREAM, INK), padding: 30, display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', borderBottom: `1px solid ${GOLD}`, paddingBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Crest size={28} color={GOLD} />
        </div>
        <div style={{ marginTop: 9, fontFamily: 'var(--font-display), Georgia, serif', fontSize: 19 }}>
          {v.occasion || 'Durbar of Chiefs'}
        </div>
        <div style={{ marginTop: 5, fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD }}>
          Order of proceedings
        </div>
        {v.date && <div style={{ marginTop: 5, fontSize: 9, color: '#6B6455' }}>{formatDate(v.date)}</div>}
      </div>

      <ol style={{ margin: 0, padding: '16px 0 0', listStyle: 'none', display: 'grid', gap: 9, flex: 1 }}>
        {items.map((item, i) => (
          <li key={item} style={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 8, fontSize: 10.5, color: '#2A2620', alignItems: 'baseline' }}>
            <span style={{ color: GOLD, fontSize: 8.5 }}>{String(i + 1).padStart(2, '0')}</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>

      <div style={{ borderTop: '1px solid #DED6C4', paddingTop: 10, fontSize: 8, textAlign: 'center', color: '#6B6455' }}>
        {BRAND.office}
      </div>
    </div>
  );
}

function EmailSignature({ v }: { v: Values }) {
  const contact = v.contact || [BRAND.email, BRAND.phone].filter(Boolean).join('  ·  ');
  return (
    <div style={{ ...sheet(CREAM, INK), padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ paddingRight: 20, borderRight: `1px solid ${GOLD}` }}>
        <Crest size={52} color={GOLD} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 17, fontWeight: 600 }}>
          {v.name || BRAND.chief}
        </div>
        <div style={{ marginTop: 5, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: GOLD }}>
          {v.style}
        </div>
        <div style={{ marginTop: 9, fontSize: 9.5, lineHeight: 1.7, color: '#5C5648' }}>
          {BRAND.office}
          {contact && (
            <>
              <br />
              {contact}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function QuoteCard({ v }: { v: Values }) {
  return (
    <div style={{ ...sheet(EBONY, IVORY), padding: 46, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -60, top: -60, opacity: 0.06 }}>
        <Glyph id="akomantoso" size={300} color={GOLD_BRIGHT} />
      </div>
      <div style={{ position: 'relative' }}>
        <Crest size={30} color={GOLD_BRIGHT} />
        <div
          style={{
            marginTop: 24,
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: (v.quote ?? '').length > 110 ? 24 : 31,
            lineHeight: 1.28,
            fontWeight: 500,
          }}
        >
          {v.quote}
        </div>
        <div style={{ marginTop: 26, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 34, height: 1, background: GOLD_BRIGHT }} />
          <span style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: GOLD_BRIGHT }}>
            {v.attribution}
          </span>
        </div>
      </div>
    </div>
  );
}

function Announcement({ v }: { v: Values }) {
  return (
    <div style={{ ...sheet(EBONY, IVORY), padding: 44, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -40, bottom: -70, opacity: 0.07 }}>
        <Glyph id="nkyinkyim" size={280} color={GOLD_BRIGHT} />
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Crest size={26} color={GOLD_BRIGHT} />
        <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD_BRIGHT }}>
          {v.kicker}
        </span>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 34, lineHeight: 1.14, fontWeight: 600, maxWidth: '84%' }}>
          {v.headline}
        </div>
        {v.detail && (
          <div style={{ marginTop: 16, fontSize: 12, letterSpacing: '0.08em', color: 'rgba(249,248,243,0.7)' }}>
            {v.detail}
          </div>
        )}
      </div>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Wordmark size={10} color={IVORY} />
        <span style={{ fontSize: 9.5, fontStyle: 'italic', color: GOLD_BRIGHT }}>{BRAND.motto}</span>
      </div>
    </div>
  );
}

function PressHeader({ v }: { v: Values }) {
  return (
    <div style={{ ...sheet(CREAM, INK), padding: 34, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${INK}`, paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Crest size={38} color={GOLD} />
          <div>
            <Wordmark size={13} />
            <div style={{ marginTop: 5, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: GOLD }}>
              {BRAND.title}, the {BRAND.titleMeaning}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-block', border: `1px solid ${INK}`, padding: '5px 10px', fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}>
            {v.status}
          </div>
          <div style={{ marginTop: 7, fontSize: 9, color: '#6B6455' }}>{formatDate(v.date)}</div>
        </div>
      </div>
      <div style={{ paddingTop: 22, flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 26, lineHeight: 1.18, fontWeight: 600, maxWidth: '88%' }}>
          {v.headline}
        </div>
      </div>
      <div style={{ borderTop: '1px solid #DED6C4', paddingTop: 10, fontSize: 8.5, color: '#6B6455', display: 'flex', justifyContent: 'space-between' }}>
        <span>{BRAND.office}</span>
        <span>{BRAND.press ? `Press: ${BRAND.press}` : 'Press desk to be confirmed'}</span>
      </div>
    </div>
  );
}

function sheet(bg: string, color: string): React.CSSProperties {
  return {
    width: '100%',
    height: '100%',
    background: bg,
    color,
    fontFamily: 'var(--font-sans), system-ui, sans-serif',
    boxSizing: 'border-box',
  };
}

const RENDERERS: Record<string, (p: { v: Values }) => React.ReactElement> = {
  letterhead: Letterhead,
  'calling-card': CallingCard,
  'compliment-slip': ComplimentSlip,
  envelope: Envelope,
  'durbar-invitation': DurbarInvitation,
  citation: Citation,
  'project-board': ProjectBoard,
  programme: Programme,
  'email-signature': EmailSignature,
  'quote-card': QuoteCard,
  announcement: Announcement,
  'press-header': PressHeader,
};

export function AssetPreview({
  asset,
  values,
}: {
  asset: BrandAsset;
  values: Values;
}) {
  const Renderer = RENDERERS[asset.id];
  if (!Renderer) return null;
  return <Renderer v={values} />;
}

export function hasRenderer(id: string) {
  return Boolean(RENDERERS[id]);
}
