# Nana Oyeadieyie Barima Essoun I

Official site for the Nkosuo Hene of Adrobaa, Tano North, Ahafo Region, Ghana.

Next.js 15, Tailwind, TypeScript. No CMS: all copy and data live in one file.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Where the content lives

Everything editable is in **`lib/content.ts`**. Change copy there, not in the
components.

## What still needs real information

These are deliberately bracketed. Nothing was invented, because false claims on
an official chief's site are worse than blanks.

| Where | Placeholder | Needs |
|---|---|---|
| `CONTACT.email` | `[OFFICIAL EMAIL]` | Palace email address |
| `CONTACT.phone` | `[OFFICIAL PHONE]` | Palace telephone |
| `CONTACT.press` | `[PRESS EMAIL]` | Press desk address |
| `app/layout.tsx` | `SITE` | The real domain, for canonical and Open Graph URLs |
| `components/Engage.tsx` | `onSubmit` | The form validates and shows success but posts nowhere. Point it at the palace inbox or a form service and delete the `setTimeout`. |
| `app/privacy`, `app/terms` | Draft text | Have counsel review before launch |

## Content from the chief

`PROJECTS`, `PILLARS` and `TAGLINE` in `lib/content.ts` now come from the
chief's own message, not from inference. Spelling was corrected for
publication (commmunities, machenize, brient); nothing else was changed.

`CHIEF.motto` is his line verbatim: **Development for the People, By the
People.** Do not paraphrase it. It carries the statement section and the
footer.

**Statuses still need his confirmation.** They were set from his phrasing, and
deliberately conservative: only the 150 dustbins are marked Delivered, because
that is the only item he described in the past tense. Water, scholarships,
youth skills and tree planting are Ongoing; roads and street lights are
Committed. Ask him which are actually complete.

### Project imagery

Five cards carry real photographs from `pics/` and `videos/`. Three had no
photograph anywhere in the source material and carry generated illustrations
instead, each marked **Illustration** on the card and flagged
`illustration: true` in `lib/content.ts`:

| Card | Image |
|---|---|
| Public toilets | render, real |
| Clean drinking water | borehole crew, frame from `IMG_3209.MP4` |
| Clean community | women receiving brooms, `IMG_9930` |
| Street and ring roads | sod cutting, `IMG_9721` |
| Youth skills | young people of Adrobaa, `IMG_9926` |
| Street lights | generated illustration |
| Scholarships | generated illustration |
| Green nature | generated illustration |

The illustrations show objects and places only, never people: a picture of a
person on a development record implies a real beneficiary, and these are not
photographs of anyone. Regenerate them with
`./scripts/generate-project-illustrations.sh` (needs `OPENROUTER_API_KEY` in
`.env`). **Replace them with real photographs as soon as the palace has any** —
then delete the `illustration: true` flag so the label disappears.

A card with no `image` at all falls back to an adinkra, which is still a
deliberate state rather than a blank.

`IMG_2017.JPG` is deliberately unused. The book in his hands has a legible
profanity on the cover.

## Judgement calls worth reviewing

- **The name.** The enstoolment film titles him `NANA OYEADIEYIE BARIMA ESSOUN`,
  without the numeral. The brief said `Essoun I`, so the numeral is used
  throughout. Change `CHIEF.fullName` in `lib/content.ts` if that is wrong.
- **Adinkra symbols** now come from the public domain set on Wikimedia Commons
  (`components/adinkraGlyphs.tsx`), not drawn by eye. Each was rendered in
  isolation and checked against its known form; several files in that category
  turned out to be simplified icon redraws rather than the real stamps and were
  discarded. The ten that shipped are the ones that verified. **The meanings
  still need confirming by the palace**, and if a symbol carries family or
  stool significance that makes it inappropriate here, say so and it goes.
- **Three continents** appears in the hero copy, inferred from the Paris and
  travel photography plus the stated import and export lines. Confirm it.

## The impact figures

`IMPACT` in `lib/content.ts` now carries GHC 5m invested, 50,000 residents
reached, 10 projects delivered and 5 communities served, as supplied. These are
public claims on an official site, so they should be traceable to something the
traditional council can produce if a journalist asks.

## Media pipeline

Source masters stay in `pics/` and `videos/` and are not committed. Web
derivatives were generated into `public/img` and `public/video`:

```bash
# stills, including HEIC
sips -s format jpeg -s formatOptions 82 -Z 1800 pics/IMG_2016.JPG --out public/img/chief-portrait.jpg

# hero loop, silent, faststart
ffmpeg -i videos/IMG_0443.MOV -an -t 7 -vf "scale=1280:-2,fps=24" \
  -c:v libx264 -preset veryslow -crf 33 -movflags +faststart -pix_fmt yuv420p public/video/hero.mp4
```

The hero serves the landscape file on desktop and a vertical cut on phones,
chosen at runtime so only one is ever downloaded. Both cuts are trimmed to the
window where the chief's face is actually in frame, and `objectPosition` anchors
the crop above centre. Retrim rather than re-crop if that ever drifts.

The enstoolment film in `components/FilmFeature.tsx` is click to play with
`preload="none"`, so its 21 MB never touches a first page load.

## Press kit page

`/media-kit` carries approved biographies (short and long, copy to clipboard),
cleared photography grouped by regalia / business / development with per image
download, forms of address, the DeoMetals summary and terms of use.

The downloadable pack is a real file at `public/press/adrobaa-press-kit.zip`,
built by hand from `public/img` plus a README carrying the biographies and
protocol notes. **Rebuild it whenever the photography or the biography
changes**, otherwise the zip and the page drift apart.

The lens toggle is hidden off the home page, because nothing on a sub page
responds to it and a control that does nothing reads as broken.

## The lens

Regal and Modern reorder the page, they never filter it. Every item stays
reachable whichever lens is active, so the record is never partly concealed
from a reader who does not touch the control. Affinities live on the content
itself (`lens: 'regal' | 'modern'`) and `byLens()` does a stable sort.

It drives: the hero subline, the Ruler panel, project order and lead sentence,
vision pillar order, and press item order.

### Nav active state

The section observer uses a thin trigger band with `threshold: 0`, never an
area ratio. A ratio is measured against the section's own height, so with a
shrunken root a tall section can never reach it: Adrobaa and Projects capped at
0.16 and never highlighted. Do not reintroduce a threshold above 0 here.

## Video encoding, read this before re encoding

`videos/IMG_0443.MOV` reports 3840x2160 but carries `rotation=-90`, so ffmpeg
**decodes it as portrait 2160x3840**. A naive `scale=1280:-2` therefore produces
a 1280x2276 portrait file, which the browser then crops to nothing on a
landscape hero. The desktop cut crops a real 16:9 window instead:

```bash
ffmpeg -ss 0 -t 6 -i videos/IMG_0443.MOV -an \
  -vf "crop=2160:1215:0:420,scale=1280:720,fps=24" \
  -c:v libx264 -preset veryslow -crf 28 -movflags +faststart \
  -pix_fmt yuv420p public/video/hero.mp4
```

Always check the OUTPUT with `ffprobe`, not the input. That fix took the file
from 4.9 MB to 1.9 MB and stopped the browser discarding most of the frame.

## Motion system

One system, in `components/motion/MotionProvider.tsx`. Do not add a second.

- **Lenis is the only smooth-scroll engine.** It drives its RAF through the
  GSAP ticker so ScrollTrigger and smooth scroll never disagree about scroll
  position. Never install Locomotive alongside it.
- Components declare intent with data attributes (`data-reveal`,
  `data-reveal-group`, `data-choreo-heading`, `data-image-reveal`,
  `data-scrub-words`, `data-parallax`, `data-magnetic`). They never animate
  themselves, so two systems can never fight over one property.
- **`has-motion` is dropped one frame after setup.** That class only prevents
  a flash before GSAP sets its start states. Leaving it on permanently hides
  any panel that re-mounts on interaction (the profile tabs, the kingdom
  timeline) because such a panel has no ScrollTrigger of its own. This was a
  real bug; do not reinstate the class as a permanent rule.
- Under `prefers-reduced-motion: reduce` nothing initialises at all: no Lenis,
  no scrubbing, no reveals. Final states render immediately.
- With JavaScript off, `has-motion` is never added and the whole page renders
  as plain static content. The tagline ships as one unsplit sentence and is
  split at runtime, keeping its accessible name.

Adding a section: give the `<section>` `data-choreo`, tag its label, heading
and lead, and wrap card grids in `data-reveal-group` with `<Reveal item>`
children. Do not tag anything that re-renders on interaction.

## Mobile

The phone layout is not the desktop layout shrunk. Specific decisions:

- **The cloth sizes itself to the viewport.** A fixed count put 420 inline
  SVGs on a phone, most below the fold: dead DOM that still costs memory and
  style recalculation on the weakest devices. It now renders what the viewport
  needs (about 24 on a phone) with larger stamps, because a texture tuned for
  a desktop reads as noise at 390px. Total DOM went 3,926 to about 1,020.
- **Hero headline steps to `text-4xl` under `sm`.** At 48px it wrapped to four
  cramped lines in 332px.
- **Hero CTAs go full width and stack** under `sm`, 52px tall, primary first.
- **The nav pill carries a compact "Request"** on phones. Previously the
  primary action existed only inside the menu overlay.
- **Impact counters are 2x2 on phones**, not four stacked cards.
- **Project filters are one swipeable snap row** under `sm`; they wrapped to
  three rows and 154px of chrome.
- **Section padding steps down one token** under `sm`.
- Menu overlay links are numbered and the lens toggle carries full labels.
- `-webkit-tap-highlight-color: transparent` and `overscroll-behavior-y: none`,
  since the components carry their own quieter pressed states.

Verified at 360 and 390px: no horizontal overflow, no element left hidden after
a full scroll and every panel exercised, every tap target at least 44px, hero
video autoplaying, zero frames over 32ms.

## The cloth

`components/AdinkraCloth.tsx` is one fixed layer behind the whole page, not a
per-section decoration, so the adinkra stays visible throughout. It parallaxes
slower than the content. Grid rows are sized explicitly (`gridAutoRows`);
with auto rows the stamps have no height to fill and the layer collapses to
nothing.

## Design system

Defined in `tailwind.config.ts` and `app/globals.css`.

- Ebony `#111111`, royal gold `#D4AF37`, ivory `#F9F8F3`, crimson `#8B0000`
- Playfair Display for headings, Plus Jakarta Sans for body
- Spacing uses three digit tokens: `p-200` is 16px, `gap-300` is 24px
- One easing curve everywhere: `ease-fluid`, `cubic-bezier(0.32,0.72,0,1)`
- Scroll reveals use `IntersectionObserver` only, never a scroll listener
- `prefers-reduced-motion` disables transitions and shows all text immediately
