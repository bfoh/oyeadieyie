import { BrandingHub } from '@/components/admin/BrandingHub';
import { BRAND_ASSETS } from '@/lib/brandAssets';

export default function BrandingHubPage() {
  const formats = new Set(BRAND_ASSETS.flatMap((a) => a.formats));

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-ebony-raised px-300 py-400 sm:px-400 sm:py-500">
        <div className="relative flex flex-wrap items-end justify-between gap-400">
          <div className="max-w-measure">
            <span className="inline-flex items-center gap-100 rounded-full border border-gold/40 px-200 py-50 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              <span className="h-[5px] w-[5px] rounded-full bg-gold" aria-hidden="true" />
              Office of the Nkosuo Hene
            </span>
            <h1 className="mt-300  text-5xl font-600 leading-[1.02] text-ivory sm:text-6xl">
              Brand
              <br />
              <span className="text-gold">engine</span>
            </h1>
            <p className="mt-300 text-base leading-relaxed text-ivory/65">
              Everything the office issues under the stool&apos;s name, drawn from
              the site&apos;s own palette and the correct forms of address. Choose a
              piece, fill in the details, take the file.
            </p>
          </div>

          <dl className="flex gap-400 rounded-2xl border border-white/10 bg-ebony px-300 py-200">
            <div>
              <dd className="text-3xl font-700 tracking-tight text-ivory">{BRAND_ASSETS.length}</dd>
              <dt className="mt-25 text-xs uppercase tracking-[0.14em] text-gold">Assets</dt>
            </div>
            <div>
              <dd className="text-3xl font-700 tracking-tight text-ivory">300</dd>
              <dt className="mt-25 text-xs uppercase tracking-[0.14em] text-gold">DPI print</dt>
            </div>
            <div>
              <dd className="text-3xl font-700 tracking-tight text-ivory">{formats.size}</dd>
              <dt className="mt-25 text-xs uppercase tracking-[0.14em] text-gold">Formats</dt>
            </div>
          </dl>
        </div>
      </section>

      <div className="mt-400">
        <BrandingHub />
      </div>
    </>
  );
}
