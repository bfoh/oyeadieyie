import { TAGLINE } from '@/lib/content';

/**
 * The statement. Words light in reading order as the section crosses the
 * viewport, scrubbed against scroll rather than fired once, so the reader
 * paces the sentence themselves.
 *
 * The text ships whole and visible. MotionProvider splits it at runtime and
 * restores an unsplit accessible name, so with JavaScript off this is simply
 * a paragraph.
 */
export function TaglineReveal() {
  return (
    <section
      aria-label="Statement"
      data-choreo
      className="relative border-t border-ebony-line bg-transparent px-300 py-800 sm:px-500 sm:py-900 lg:px-800"
    >
      <div className="relative mx-auto w-full max-w-[1280px]">
        <p
          data-scrub-words
          className="max-w-[980px] font-display text-4xl font-500 leading-[1.22] text-ivory sm:text-5xl lg:text-6xl"
        >
          {TAGLINE}
        </p>
      </div>
    </section>
  );
}
