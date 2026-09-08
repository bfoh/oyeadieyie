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
an official chief's site are worse than blanks. **Nothing bracketed is ever
printed**: every read goes through `contactValue()` in `lib/content.ts`, which
returns null for an unsupplied value, and the line, link or whole panel is
omitted instead.

| Where | Placeholder | Needs |
|---|---|---|
| `CONTACT.email` | `[OFFICIAL EMAIL]` | Palace email address |
| `CONTACT.phone` | `[OFFICIAL PHONE]` | Palace telephone |
| `CONTACT.press` | `[PRESS EMAIL]` | Press desk address |
| `CONTACT.whatsapp` | `[WHATSAPP NUMBER]` | International format, `233XXXXXXXXX`. Supplying it makes the WhatsApp route appear beside the form and in the footer. |
| `lib/site.ts` | `SITE` | The real domain, for canonical, sitemap and Open Graph URLs. Override with `NEXT_PUBLIC_SITE_URL`. |
| `IMPACT` | investment, reach, communities | Figures the traditional council can produce if a journalist asks |

### The engagement form

`components/Engage.tsx` posts to `app/api/engage/route.ts`, which sends through
Resend. Two environment variables turn it on:

```
RESEND_API_KEY=...
ENGAGE_TO=office@example.com
ENGAGE_FROM="Adrobaa site <site@yourdomain>"   # optional
```

Until both are set the route answers `503 not_configured` and the form shows
**"That message did not send"** with the direct routes instead. It never
reports a success it cannot back up. The previous version waited 900 ms and
claimed the message had reached the office while sending nothing at all; every
enquiry made in that period was lost, and the sender had no way to know.

A honeypot field named `website` is submitted with the form. Anything that
fills it is answered with a success it does not receive.

### Legal pages

`app/privacy` and `app/terms` no longer tell readers they are unreviewed
drafts; that note lives in a comment at the top of each file, where it belongs.
Both still need counsel, particularly against Ghana's Data Protection Act,
2012 (Act 843), now that the form actually collects and transmits names,
addresses and organisations.

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

Three cards — street lights, scholarships, tree planting — carry generated
illustrations, because no photograph of that work exists anywhere in the
source material. Each is marked **Illustration** on the card and flagged
`provenance: 'illustration'` in `lib/content.ts`. They show objects and places
only, never people: a picture of a person on a development record implies a
real beneficiary, and these are not photographs of anyone.

They are also excluded from the press kit, which is cleared photography for
editorial use, and a newsroom should never be handed a generated image.

**Replace them with real photographs as soon as the palace has any**, then
delete the `provenance` flag so the label disappears. Regenerate with
`./scripts/generate-project-illustrations.sh` (needs `OPENROUTER_API_KEY` in
`.env`). Setting `image: undefined` on a card falls back to an adinkra
instead, which is the state the component uses for a card with no imagery at
all.

| Card | Image |
|---|---|
| Public toilets | render, labelled `Render`, plus a four-frame progress sequence |
| Clean drinking water | borehole crew, plus a three-frame sequence |
| Clean community | women receiving brooms, `IMG_9930` |
| Street and ring roads | sod cutting, `IMG_9721` |
| Youth skills | young people of Adrobaa, `IMG_9926` |
| Street lights, Scholarships, Green nature | generated illustration, labelled `Illustration` |

`provenance: 'photo' | 'render' | 'illustration'` on a project drives the badge
on the card, so the page and the press kit can no longer disagree about whether
a reader is looking at a building or a drawing of one.

### Renders become buildings

`components/ProjectProgress.tsx` renders the `progress` sequences declared in
`lib/content.ts`: render → foundation trenches → footprint → blockwork for the
sanitation block, and rig → casing → first water for the boreholes. Every one
of these photographs was already in `public/img`, referenced by nothing, while
the section headline promised exactly this sequence. Captions describe only
what is visible in the frame.

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

The projects tile previously read **10 projects delivered** while the record
printed directly beneath it listed one delivered item. It is now derived from
`PROJECTS.length` and labelled **Projects on the agenda**, so changing the
record changes the number and the two can never contradict each other again.

Every stat carries an `attribution` of `counted` or `stated`, and
`IMPACT_SOURCE` prints under the grid saying which is which. Investment, reach
and community figures remain the office's own; they should be traceable to
something the traditional council can produce if a journalist asks.

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

The downloadable pack at `public/press/adrobaa-press-kit.zip` is built by
`node scripts/build-press-kit.mjs`, which reads `PHOTO_SETS` in
`lib/presskit.ts` — the same source the page renders from — so the pack and the
page cannot list different photographs. It writes a README carrying the
biographies, forms of address, terms and a captioned manifest, then prints the
size and count to paste back into `KIT`. Run it whenever the photography or the
biography changes. It fails loudly if a listed photograph is missing.

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

## Typography

Three faces, each with one job:

- **Cinzel** sets the wordmark alone, in capitals. It is drawn from Roman
  inscriptional lettering — the forms cut into monuments and public buildings
  — so a name set in caps reads as an inscription rather than as shouting. It
  is the freely licensed relative of Trajan.
- **Playfair Display** sets the headings.
- **Plus Jakarta Sans** sets everything else.

**Numeric font weights are declared in `tailwind.config.ts`.** The components
have always written `font-500`, `font-600` and `font-700`, but Tailwind ships
named weights only (`font-semibold`), so all 61 of those classes silently did
nothing and every heading on the site rendered at 400. The config now declares
the numeric keys. If headings ever look flat again, check that block first.

## Accessibility decisions worth keeping

- **The adinkra glosses are a disclosure, not a hover effect.** They were
  revealed by `group-hover` and `group-focus-visible` alone. A touch device has
  no hover, and tapping a button sets `:focus` but not `:focus-visible`, so on
  a phone all ten proverbs were unreachable. They now open on click with
  `aria-expanded`. Do not "simplify" this back to hover.
- **The mobile menu is modal.** Focus moves in, is trapped, and returns to the
  hamburger on close; Lenis is stopped through the `nav:lock` / `nav:unlock`
  events rather than by reaching into the motion system. The overlay unmounts
  700 ms after closing so the fade-out has something to animate — the `hidden`
  attribute used to land immediately and the transition never played.
- **`section[id] { scroll-margin-top: 96px }`.** Lenis applies a −96 px anchor
  offset, but only for clicks it handles. Shared links, back-forward restores
  and every reader with reduced motion land behind the fixed nav pill without
  this rule.
- **`text-ivory/40` is 3.67:1 on the ebony ground and fails AA.** Small text
  uses `/50` (5.08:1). `gold-dim` is 4.17:1: borders and hover states only,
  never text.
- **The profile toggle is buttons with `aria-pressed`, not tabs.** It carried
  `role="tab"` without arrow-key navigation or a roving tabindex, which
  promises behaviour the page does not have. The panel is `aria-live="polite"`
  because the lens rewrites it silently.

## Performance decisions worth keeping

- **Never call `video.load()` after setting `<source>` declaratively.** React
  mounts the source and the browser starts fetching; `load()` restarts it. The
  network log showed the hero downloaded twice, 2.0 MB for a 1.05 MB clip.
- **The hero still is a CSS background chosen by media query**, not a `poster`
  attribute and not a `<picture>`. A `poster` cannot be right in server-rendered
  HTML because orientation is unknown, so phones fetched the landscape still
  and then the portrait one. A `<picture>` was tried and was worse: Chromium's
  preload scanner fetches the `<img src>` fallback alongside the matching
  `<source>`. `<link rel="preload" media="...">` was also tried and fetched
  both files regardless of its media attribute. One media query, one file.
  The video then adopts that same, already-cached file as its `poster` once
  `src` resolves, which costs no request and gives the video an early paint.
- **`has-motion` has a 1200 ms failsafe.** The class hides pre-reveal content,
  which meant the chief's name could not paint until the GSAP and Lenis bundles
  had downloaded and run. A slow bundle should cost the entrance, not the
  words. If the failsafe has fired, the class is not re-added.
- **Static media carries immutable cache headers** (`next.config.mjs`). Change
  the filename when the media changes.

## Updates

`UPDATES` in `lib/content.ts` is empty and `components/Updates.tsx` renders
nothing while it is. Add entries newest first with an ISO `date`; the section
shows the three most recent. Nothing else on the site carries a date, so this
is the only place the record can accumulate — and it is what would make the
impact figures above citable rather than asserted.
