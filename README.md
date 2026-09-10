# Nana Oyeadieyie Barima Essoun I

Official site for the Nkosuo Hene of Adrobaa Traditional Authority, Tano North,
Ahafo Region, Ghana.

Next.js 15, Tailwind, TypeScript. No database: the copy the office changes
lives in a versioned JSON document in Vercel Blob, edited from `/admin`, and
everything the office does not change is compiled in from `lib/content.ts`.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Where the content lives

Two places, and the split matters.

**The store** — a JSON document in Vercel Blob, edited at `/admin` and read by
`readContent()` in `lib/store.ts`. It holds the updates, the statements, the
events, the gallery, the contact details, the enquiries the public form
captures, and the development record (projects and impact figures). The office changes these
without a developer, and the public site follows within about half a minute.

**`lib/content.ts`** — the biography, the FAQ, the adinkra, the pillars, the
engagement routes, the press photography. These change rarely and should go
through review, so they stay in the repository.

`lib/content.ts` also holds the **seed** for everything in the store: on a
deployment with no store connected, or before the office has ever saved,
`baseContent()` returns those constants and the site renders exactly as it
would have before there was an admin. So the constants are the fallback, never
dead weight — but once the office has saved, editing them in the repository
changes nothing on the live site. Edit at `/admin` instead.

## What still needs real information

These are deliberately bracketed. Nothing was invented, because false claims on
an official chief's site are worse than blanks. **Nothing bracketed is ever
printed**: every read goes through `isSupplied()` in `lib/content.ts`, which
returns null for an unsupplied value, and the line, link or whole panel is
omitted instead. The office can fill these in at `/admin/content` without a
deploy; the brackets below are what a fresh deployment starts with.

| Where | Placeholder | Needs |
|---|---|---|
| `CONTACT.email` | `[OFFICIAL EMAIL]` | Palace email address |
| `CONTACT.phone` | `[OFFICIAL PHONE]` | Palace telephone |
| `CONTACT.press` | `[PRESS EMAIL]` | Press desk address |
| `CONTACT.whatsapp` | `[WHATSAPP NUMBER]` | International format, `233XXXXXXXXX`. Supplying it makes the WhatsApp route appear beside the form and in the footer. |
| `lib/site.ts` | `SITE` | The real domain, for canonical, sitemap and Open Graph URLs. Override with `NEXT_PUBLIC_SITE_URL`. |
| `CHIEF.title` | `Adrobaa Traditional Authority` | Adopted on the office's written instruction. The repository had only "Adrobaa" before it. **Confirm the authority's formal name with the palace**, since an unverified institutional name in a chief's title is exactly the class of claim this site otherwise refuses to print. |
| Impact figures | investment, reach, communities | Figures the traditional council can produce if a journalist asks. Set them at `/admin/projects`; the projects count is derived from the list and cannot be typed in. |

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

`PROJECTS`, `PILLARS` and `TAGLINE` in `lib/content.ts` come from the chief's
own message, not from inference. `PROJECTS` now seeds the store and is edited
at `/admin/projects`; the other two are still edited here. Spelling was corrected for
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
`provenance: 'illustration'`. That flag is shown but never editable in the
admin — the office can move a project to Delivered, which is its own record to
keep, but it cannot relabel a picture as something it is not. They show
objects and places
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

`components/ProjectProgress.tsx` renders the `progress` sequences carried on
the project records: render → foundation trenches → footprint → blockwork for the
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

The lens toggle that used to be hidden here is gone from the whole site; see
**There was a lens, and there is not any more**.

## The nine sections

The public page is nine named chapters in the order the office set out, on one
scroll, and `NAV_LINKS` in `lib/content.ts` is the single list that names them:

| Anchor | Chapter | Built from |
|---|---|---|
| `#about` | About Nana | `BIO_LONG` from the press kit, plus the stool and DeoMetals fact panels |
| `#chieftaincy` | Chieftaincy & Leadership | `TIMELINE` and `PILLARS` |
| `#speeches` | Speeches & Statements | `TAGLINE` as the scrubbed lead, plus `statements` from the store |
| `#development` | Community Development | projects, impact, `ProjectProgress` |
| `#events` | Events & Engagements | events from the store, and `ENGAGE_ROUTES` |
| `#culture` | Traditional Culture | `ADINKRA`, the enstoolment film, ceremonial photography |
| `#news` | News & Media | updates from the store, `PRESS`, the press kit |
| `#gallery` | Gallery | the gallery from the store, with a lightbox |
| `#contact` | Contact | the engagement form, contact details and the FAQ |

`NAV_LINKS` carries `label` (the nav's short form), `name` (the heading) and
`numeral`. Add a section by adding an entry there and a `<Section id="...">`;
nothing else needs to know.

**`#contact` also carries `id="engage"`.** Links to `/#engage` were shared
before this section was called Contact, and a fragment cannot be redirected.

### Three openings, not one repeated nine times

`components/Section.tsx` draws the chapter mark: the numeral, a hairline, the
name. Every section used to open with the same gold rule over the same tracked
capitals — a category label, nine times, which is chrome rather than
information. The numeral carries something a reader actually wants: where they
are in the nine. They are Roman because the holder of the stool is Essoun the
First.

The `SectionHead` variants cycle so the page does not drone:

- **wide** — numeral, name and lead across the measure. About, Development, News.
- **split** — numeral and name in a narrow column, content beside. Chieftaincy,
  Events, Contact.
- **quiet** — nothing drawn; the content is its own heading. Speeches, Culture,
  Gallery. `<Section quiet>` puts an `sr-only` heading in place so all nine
  chapters are still in the outline a screen reader builds.

Spend the boldness in one place: the statement in `#speeches` takes the whole
measure with no chrome at all, and everything around it stays quiet so that it
can.

### There was a lens, and there is not any more

The site used to carry a Regal / Modern toggle that reordered — never filtered
— the hero subline, the profile panel, the projects, the pillars and the press
items. It is gone, along with `LensContext`, `byLens()` and every `lens:` field.

Nine sections named after their subjects give a reader the whole record by
name. A control that reorders what is already named is chrome, and it cost a
provider, a hook, a sort and a field on four content types. If it is ever
wanted back, it was a stable sort keyed on an affinity declared on the content
itself.

The dual profile went with it. **About Nana carries both offices at once**,
because the point the site makes is that the commercial record and the
development record are the same record, and a control that showed one at a time
argued against it.

### Nav active state

The section observer uses a thin trigger band with `threshold: 0`, never an
area ratio. A ratio is measured against the section's own height, so with a
shrunken root a tall section can never reach it: Adrobaa and Projects capped at
0.16 and never highlighted. Do not reintroduce a threshold above 0 here.
Verified across all nine sections after the restructure.

**Nine links need room.** They sit in the pill from `xl` up and live in the
overlay below it; the wordmark steps to the shorter form of his name until
`2xl`. The overlay scrolls rather than centring, because a centred column of
nine loses its FIRST item behind the pill — where nobody thinks to look.

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
- Menu overlay links carry their chapter numeral, and the overlay scrolls
  rather than centring, since nine items no longer fit a centred column.
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

- **Cormorant Garamond** sets the wordmark alone, in capitals.
- **Playfair Display** sets the headings.
- **Plus Jakarta Sans** sets everything else.

**The wordmark's treatment matters more than its typeface.** The reference is
the mark used by royal institutions: Roman capitals, light on the page, widely
letterspaced, with fine hairline serifs. Two earlier attempts used reasonable
faces (Cinzel, then Bodoni Moda) set bold and tight, and both read as emphasis
rather than as an institution. What fixed it was weight 600 instead of 700 and
tracking opened to 0.15–0.18em. If the mark ever looks wrong again, check the
tracking and the weight before changing the face.

Caps set tight read as a shout. Caps set open read as an inscription.

`next/font` rejects the `axes` option whenever an explicit `weight` is given,
so a variable font's optical size axis cannot be pinned alongside a weight.

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
- **The profile toggle is gone**, and with it a `role="tab"` that carried no
  arrow-key navigation or roving tabindex — markup promising behaviour the page
  did not have. About Nana shows both offices at once instead. The pattern is
  worth remembering for the timeline in Chieftaincy, which is still buttons
  with `aria-pressed` and never tabs, and whose caption is `aria-live="polite"`
  because it is rewritten in place.
- **The gallery lightbox is modal in the same way the menu is.** Focus moves
  in, is trapped, and returns to the tile that opened it; Escape closes; arrows
  move between photographs; Lenis is stopped through `nav:lock` / `nav:unlock`
  rather than by reaching into the motion system.

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
- **Static media carries immutable cache headers** (`next.config.mjs`), so the
  filename MUST change when the media changes. This was learned the hard way:
  the hero video was replaced in place and the browser kept serving the old
  one from cache. Hence `hero-v2.mp4`. Bump the suffix on every re-encode.
- **Never call `video.load()` after appending a `<source>`, and never rely on
  an appended `<source>` at all.** A media element runs resource selection
  when it is inserted; a `<source>` added afterwards only starts a load if the
  browser re-runs that algorithm, which Chrome does and Safari does not. Since
  orientation is unknown at render time, the server sent a `<video>` with no
  source, and on iPhone it simply sat there. `Hero.tsx` now assigns `src` to
  the element itself, which invokes resource selection everywhere, once.
- **Encode at the master's frame rate, which is 30.** A 24fps video on a 60Hz
  display gets 2.5 refreshes per frame, so frames alternate between 2 and 3
  refreshes. That cadence is judder, and it reads as "the video stutters" while
  every metric reports zero dropped frames. 30fps divides 60 exactly. This was
  the laptop stutter; downsampling to 24 for file size caused it.
- **Level 3.1, High profile, yuv420p in TV range.** ffmpeg had been tagging the
  output `yuvj420p` (full-range JPEG colour, which Safari handles badly) and
  choosing Level 5.0 for a 640px clip, which older iOS decoders refuse
  outright. End the filter chain with `format=yuv420p,setrange=tv` and set
  `-profile:v high -level:v 3.1` explicitly; never let ffmpeg pick the level.
- **The hero video is sourced during HTML parse, by an inline script directly
  beneath the element.** This is what finally made an iPhone autoplay it.
  Safari grants autoplay to a muted inline video that has a source when the
  parser reaches it, and refuses a `play()` call made later from a hydration
  effect. Orientation is only knowable in the browser, so React cannot put the
  `src` in server-rendered HTML — the inline script can. The React effect no
  longer touches the source; it only retries after Low Power Mode refusals, on
  first touch, and when a backgrounded tab returns.
- **Scrims are gradients, never `mask-image`.** A mask makes the compositor
  re-composite the masked area against whatever is beneath it, and beneath
  these is a playing video. A `linear-gradient` background is the same picture
  for free.
- **There is no parallax on this site.** The hero was the last thing using it
  and it is gone: moving a playing video on every scroll frame, underneath a
  fixed blurred nav, is a great deal to pay for an effect a reader does not
  consciously notice, and it was the remaining suspect for the laptop judder.
  The mechanism went with it rather than being left as dead code — if it is
  ever wanted back, it was a `[data-parallax]` sweep in `MotionProvider`, and
  the one rule worth remembering is `scrub: true` rather than a number, since
  Lenis already smooths the scroll and two chained smoothers make a layer swim
  instead of track.
- **The cloth layer does not move.** Six per cent of parallax drift was not
  perceptible, and paying for it meant a fixed, full-viewport SVG layer was
  re-composited every scroll frame underneath a backdrop-blurred nav, which
  then had to re-blur moving content continuously.
- **The hero loop is cross-dissolved.** The master is a single handheld shot
  in which the camera never returns to where it started, so no window of it
  loops naturally: the best candidate still differed by 71/255 between its
  first and last frame, and the shipped cut differed by 121. The published
  cuts blend their tail back over their head (0.8s desktop, 0.7s mobile), so
  the last frame matches the first and the loop stops jumping. Rebuild with
  the `blend=all_expr` recipe in git history rather than a plain trim.

## The admin

`/admin`, behind a password. Three pages: a dashboard counted from the
published content, the branding hub, and a checklist of what the site is
waiting on from the palace.

```
ADMIN_PASSWORD=...        # at least 8 characters, set in Vercel
```

Until it is set the admin refuses every attempt rather than falling back to a
default, because a default password on a public address is the same as no
password at all. The cookie carries an HMAC of a fixed label under the
password, never the password itself.

Two layers guard it. `middleware.ts` bounces anyone without a cookie before
any admin markup renders; the layout in `app/admin/(protected)/` verifies the
cookie's signature, which the middleware cannot do because the edge runtime
has no `node:crypto`. The login page sits outside that route group — when it
was inside, it redirected to itself forever. Admin pages are `noindex` and
absent from the sitemap.

### Managing the site

`/admin/content` edits the noticeboard: updates, statements, events, gallery
photographs and the contact details. `/admin/projects` edits the development record — the
projects and the three stated impact figures. `/admin/enquiries` is everything
the public form has sent. The adinkra, the biography and the FAQ stay in
`lib/content.ts`.

The home page shows only part of each list — the caps are in `lib/limits.ts`,
and the admin marks the entries that fall past them rather than dropping them
silently.

Storage is **Vercel Blob**. The document is **versioned**: each write goes to
`content/site-<timestamp>.json` and the newest is read back, keeping the three
most recent. This is not tidiness — blob URLs are served from a CDN with a
month-long `max-age`, so overwriting one path meant a read straight after a
write returned the *previous* document, and the next write then persisted that
stale copy over the office's change. A new path each time has no cached
version to return. Uploaded photographs live in the same store under
`gallery/`.

```
BLOB_READ_WRITE_TOKEN=...   # appears once the Blob store is connected
```

The store `adrobaa-content` exists on the project but must be **connected**
in the Vercel dashboard under Storage — the CLI cannot complete that step
without a prompt. Until it is connected the site falls back to the content
compiled into the build, the admin says so plainly, and writes return 503
rather than pretending to save.

Updates and events each take a photograph. Attachments are uploaded with
`mode=attachment`, which stores the file but deliberately does NOT add it to
the gallery: a picture belonging to one announcement should not also turn up
in the gallery grid on the home page. A description is required, as everywhere
else here.

Uploaded photographs render through a plain `<img>` rather than `next/image`.
The blob store is an arbitrary host the optimiser would have to be told about,
and the office should be able to upload without anyone editing a config file.

Two rules worth keeping:

- **`readContent()` never throws.** A site that cannot reach its store should
  still render from the build rather than fail.
- **Every writing route calls `isAdmin()` first.** The middleware guards pages,
  not API routes; without that check an unsigned POST could edit the site.

Public pages read the store with `revalidate = 30`, so a change shows within
about half a minute without making each visitor wait on a fetch.

### Enquiries

`/admin/enquiries`. Everything sent through the form on the home page.

**Capture first, notify second.** `app/api/engage/route.ts` writes the enquiry
to the store *before* it attempts any email, so storage is the record and email
only a convenience. It used to do the opposite: with no Resend key configured
it returned 503 and the enquiry was gone — every appearance request,
partnership approach, diaspora offer and press enquiry lost, on a site whose
entire purpose is to attract them. The route now succeeds whenever the enquiry
is safely stored, and reports failure only when nothing anywhere has a copy.

`RESEND_API_KEY` and `ENGAGE_TO` remain optional; setting them adds an email
notification on top.

**Clash detection.** The site tells readers twice that appearances are
"confirmed against the traditional calendar, which takes precedence over all
other commitments", but the date lived inside a prose field where nothing could
check it. The form now takes an optional requested date, and the inbox compares
it against the events the office already keeps — flagging anything within two
days, because a durbar occupies the days around it as well as its own.

**The form is a public write path**, the one place a stranger can grow a
document that every public page render fetches. Hence the flood window in the
route, and `MAX_ENQUIRIES`. Trimming only ever removes enquiries the office has
already dealt with, oldest first, so a flood can never push an unanswered one
out of the record.

### Photographs the office uploads

**Resized in the browser, before upload** (`lib/resizeImage.ts`), not on the
server. The office uploads over Ghanaian mobile data and a phone photograph is
commonly 4 to 8 MB, so doing it here saves their upload as well as the
visitor's download; a server pass would still make them send all of it.
Measured on a real 4672x7008 photograph from `pics/`: **9.0 MB to 365 KB, 96%
smaller**, at 1067x1600 in WebP.

Two details that matter. `createImageBitmap(file, { imageOrientation:
'from-image' })` — phone photographs carry their rotation in EXIF rather than
in the pixels, and without it they upload sideways. And the helper returns the
original untouched if the encode fails or somehow produces something larger,
rather than making things worse.

The 8 MB limit stays as the *input* ceiling; it is the stored artefact that has
to be small.

Uploads are served through `next/image`: the blob host is allow-listed in
`next.config.mjs` under `images.remotePatterns`, so an uploaded photograph gets
the same AVIF/WebP and responsive srcset as anything in `public/`. The plain
`<img>` tags in `Kingdom`, `Updates` and `Events` existed only because that
host was not allow-listed.

**Stored files** (`/admin/content`, bottom) lists blobs nothing points at and
deletes them. Two ways they accumulated invisibly: a photograph chosen for an
update that was never posted is uploaded the moment it is picked, and every
press of Share publishes a fresh PNG for ever. Deletion re-checks the document
first, so a file that has been attached to something since the list was taken
is refused rather than removed.

### The branding hub

`lib/brandAssets.ts` declares what the office can issue and the fields each
piece takes; `components/admin/AssetPreview.tsx` draws them. Twelve assets
across stationery, ceremonial and digital: letterhead, calling card,
compliment slip, envelope, durbar invitation, citation, project signboard,
order of proceedings, email signature, quote card, announcement card and
press release header.

**Photography.** `BRAND_PHOTOS` in `lib/brandAssets.ts` is a short curated set
cut for three shapes — portrait, head and wide — and stored in
`public/img/brand/`. Six assets carry one: the calling card and the email
signature ring a headshot in gold, the invitation sets a portrait behind the
type at low opacity, the quote card gives the chief the right-hand two thirds,
the announcement runs full bleed with the type banded along the bottom, and the
press header puts a headshot beside the release status. Every one can be
switched or set to None from the editor, because a formal sheet often reads
better without a face on it.

Two things learned cutting them: a side scrim puts the headline on the chief's
face, since both wide frames place him on the left, hence the bottom band on
the announcement; and a photograph that stops halfway across a card shows as a
vertical seam unless the scrim fades *across* it rather than ending with it.

**The writing assistant.** `POST /api/admin/assist` drafts wording for a field
through the Vercel AI Gateway, in the office's register: British spelling, the
correct style of address, no marketing language, and nothing claimed that was
not supplied. It writes into the field and stops there — the office edits and
approves before anything prints. Nothing it produces reaches the public site or
a downloaded file without a person pressing a button.

On Vercel the gateway authenticates from the deployment's OIDC token, so no key
is needed in production; locally set `AI_GATEWAY_API_KEY`. When it is not
configured the button says so rather than failing silently.

Note for anyone reading the reference site: the purple **AI** badge on Matrix's
branding hub is the Adobe Illustrator file format, sitting beside PNG and PDF.
It is not an assistant. This one is a deliberate addition.

Three things worth keeping:

- **Paper prints dark ink on cream, not the site's ebony.** A letterhead that
  arrives as a solid black sheet is one nobody can afford to print. Screen
  assets keep the site's ebony and gold.
- **Sharing has to be two mechanisms, because the platforms are two kinds.**
  Facebook, WhatsApp as a message, X, LinkedIn and Telegram accept a LINK and
  will not take an image posted from a web page, so `POST /api/admin/share`
  publishes the artwork to a public blob URL first and that URL is what the
  platform buttons carry. Instagram, TikTok and a WhatsApp status accept
  neither — there is no web share intent for any of them, only an upload from
  the phone — so the panel says so and offers the device share sheet, a
  download and a clipboard copy instead of a button that could not work.

  The first attempt used `navigator.share` alone. On a phone that is right and
  lists WhatsApp, Instagram and the rest. On a Mac the identical call produces
  AirDrop, Messages and Freeform, because no social app registers itself as a
  macOS share extension — so the one button was useless on a laptop while the
  label promised otherwise. Keep the device sheet, but never as the only route.

  Shared images render at 2x rather than the 3x used for print: every one of
  these platforms recompresses what it receives, so the extra pixels buy
  nothing and cost upload time on a Ghanaian connection. Each share publishes
  under a fresh filename — overwriting one path per asset would be tidier but
  would silently change the picture inside a post made last month.
- **The download is exported from the very node on screen**, via
  `html-to-image` at 3x, so the file cannot drift from the approved preview.
  PDFs wrap that image at the sheet's real millimetre size.
- **A scaled preview must be out of the layout flow.** `transform: scale()`
  shrinks a box on screen but leaves its ORIGINAL width in the layout, so an
  A4 sheet drawn at 546px kept a 546px footprint inside every card. On a phone
  that made each card wider than the screen, and the right of it was silently
  cut off by the admin's `overflow-x-hidden`. The artwork is absolutely
  positioned inside its frame, so it cannot push anything.
- **Type inside a preview is set in absolute pixels against a canonical
  canvas**, and every appearance scales the whole thing with a transform.
  Millimetre assets scale by physical size, so a calling card stays small
  beside an A4 sheet; pixel assets all draw on one 560px canvas. Do not
  re-flow previews to fit their container, or a thumbnail stops being an
  honest miniature of the sheet.

## Statements

Posted at `/admin/content` under **Statements**, and rendered by
`components/Speeches.tsx` beneath the vision statement.

**The date is optional, and it is the only dated record here where that is
true.** His standing words were not said on a day anybody recorded, and the
office must be able to post them without inventing one. An empty date is
stored as `undefined`; a non-empty one that will not parse is refused. Undated
entries sort last on the page and never reach the admin calendar, because a
calendar entry without a date is not one.

`STATEMENTS` in `lib/content.ts` seeds exactly one entry: his motto, with a
paragraph on what it means. `TAGLINE` is deliberately **not** seeded as a card
as well — it is already the section's lead, set large and scrubbed word by
word, and printing the same sentence twice on one screen is a stutter rather
than a record.

## Updates

Posted at `/admin/content`, stored with an ISO `date`, and rendered newest
first by `components/News.tsx`, which renders nothing at all while there
are none. The home page shows the three most recent (`HOME_LIMITS.updates`);
older ones stay in the store but have no archive page to fall back to, and the
admin says so. Nothing else on the site carries a date, so this is the only
place the record can accumulate — and it is what would make the impact figures
above citable rather than asserted.
