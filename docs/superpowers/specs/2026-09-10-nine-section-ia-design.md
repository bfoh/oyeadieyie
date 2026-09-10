# Nine-section public information architecture

**Date:** 2026-09-10
**Status:** Approved for planning
**Scope:** The public site only. The admin gains one panel because a new
section needs somewhere to be edited; nothing else about the admin changes.

## Why

The office supplied a written brief naming the site's sections and its title
block. The site as built has six nav links across thirteen sections, organised
around a regal/modern lens rather than around named subjects. The brief names
nine subjects and expects a reader to find each one by name.

The brief:

```
Nana Oyeadieyie Barima Essoun I
Nkosuo Hene of Adrobaa Traditional Authority

Leadership · Service · Development · Tradition

Sections:
  About Nana
  Chieftaincy & Leadership
  Speeches & Statements
  Community Development
  Events & Engagements
  Traditional Culture
  News & Media
  Gallery
  Contact
```

## Decisions taken before this spec

1. **One scroll, nine anchors.** No new routes. The single-page architecture,
   the motion system and the media pipeline are all built around it, and the
   brief describes sections rather than pages.
2. **Speeches & Statements is admin-managed, seeded with two verbatim lines.**
   New record type in the Blob store, edited at `/admin/content`. Seeded from
   the two things the chief has actually said that are already in the
   repository: his motto and his vision statement.
3. **DeoMetals moves inside About Nana; the lens is removed.** Nine named
   sections give the reader the whole record by name. A control that reorders
   what is already named is chrome.
4. **Title and strapline adopted; the motto is not displaced.** The motto is
   his own words and outranks a strapline.

## Constraints inherited from the project

These are not negotiable and every task below is bound by them.

- **Nothing invented.** No prose is written for the chief. Copy either already
  exists in `lib/content.ts` / `lib/presskit.ts`, or is structural (a section
  heading, a label). Unsupplied values pass through `isSupplied()` and are
  omitted, never printed.
- **Existing media only.** No new photographs, no new video, no new
  illustrations. Every image referenced below already exists in `public/img`
  or `public/video`.
- **One motion system.** Sections declare intent with data attributes
  (`data-choreo`, `data-reveal`, `data-reveal-group`, `data-choreo-heading`,
  `data-image-reveal`, `data-scrub-words`). No component animates itself. Do
  not tag anything that re-renders on interaction.
- **Nav observer uses `threshold: 0`** with a thin trigger band. Never an area
  ratio.
- **`readContent()` never throws**; every writing route calls `isAdmin()`
  first; writes read `{ fresh: true }`.
- **Immutable media cache**: if a file in `public/` changes, its name changes.
  No file in `public/` changes in this work.

---

## Section 1 — The nine sections

Order on the page follows the brief exactly.

### `#about` — About Nana

Replaces `components/DualProfile.tsx` with `components/About.tsx`.

One section, both faces, no tabs and no lens:

- Lead portrait `/img/chief-portrait.jpg`, with `data-image-reveal`.
- Biography: `BIO_LONG` from `lib/presskit.ts`, rendered as its three
  paragraphs. This is the biography already approved for press use, so no new
  prose is written and the page and the press kit cannot disagree.
- Two fact panels, side by side on `lg`, stacked below:
  - **The stool** — `PROFILES.regal.facts` (title, stool, council, duties).
  - **The business** — `PROFILES.modern.facts` (company, licence, operations,
    trade), with `/img/exec-standing.jpg`.
- `PROFILES.regal.lead` and `PROFILES.modern.lead` carry each panel.

`PROFILES` keeps its shape; only `tab` becomes unused and is removed along
with the lens.

The `aria-live="polite"` on the old panel goes with the tabs: nothing rewrites
in place any more.

### `#chieftaincy` — Chieftaincy & Leadership

`components/Chieftaincy.tsx`, merging `Kingdom.tsx` and `Vision.tsx`.

- Heading **Chieftaincy & Leadership**; label keeps `CHIEF.place · CHIEF.region`.
- `TIMELINE` (5 entries) as the existing selectable list plus figure. Behaviour
  is unchanged: `aria-pressed` buttons, `key={active.id}` on the figure.
- `PILLARS` grid beneath, in declared order, phosphor icons unchanged.
- The gallery block that lived at the bottom of `Kingdom` is **removed from
  here** and becomes `#gallery`.

`Kingdom.tsx` and `Vision.tsx` are deleted.

### `#speeches` — Speeches & Statements

New `components/Speeches.tsx`. Absorbs `TaglineReveal.tsx`, which is deleted
as a standalone section.

- Lead: `TAGLINE` with `data-scrub-words`, exactly as `TaglineReveal` renders
  it today — one unsplit sentence in the markup, split at runtime, so the
  accessible name survives and JavaScript-off gets a plain sentence.
- Beneath: statement cards from `content.statements`, capped at
  `HOME_LIMITS.statements` (3), newest first, undated last.
- Each card: title, occasion, date when present, body, optional pull-quote set
  in display type, optional photograph.
- With no statements at all the section still renders, because the lead is
  compiled in and always present.

### `#development` — Community Development

`components/Projects.tsx`, re-anchored and re-headed.

- `id="projects"` → `id="development"`; heading becomes **Community
  Development**.
- Impact grid, `IMPACT_SOURCE` attribution line, tag filters, provenance
  badges and `ProjectProgress` sequences all unchanged.
- `byLens` sorting removed; projects render in stored order, which the admin
  can already reorder with `move-project`.

### `#events` — Events & Engagements

`components/Events.tsx`, re-anchored and re-headed.

- `id="events"`, heading **Events & Engagements**.
- Events from the store, soonest first, past ones dropped, capped at
  `HOME_LIMITS.events` (4). Unchanged.
- **Change of behaviour:** with no events the component currently renders
  nothing, which under the new IA leaves a nav anchor pointing at nothing. It
  now renders the section with `ENGAGE_ROUTES` as "what the office accepts",
  and a link to `#contact`. The anchor is never dead.

### `#culture` — Traditional Culture

New `components/Culture.tsx`, merging `Adinkra.tsx` and `FilmFeature.tsx`.

- Ten adinkra from `ADINKRA` with the existing **click** disclosure and
  `aria-expanded`. Not hover. This is a documented accessibility fix and must
  survive the move intact.
- The enstoolment film from `FILM`, still `preload="none"` and click-to-play,
  so its 21 MB never touches a first page load.
- A ceremonial imagery band using files already in `public/img`:
  `kingdom-festival.jpg`, `kingdom-queenmothers.jpg`, `procession-kente.jpg`,
  `kingdom-durbar.jpg`. Alt text copied from `GALLERY` / `PHOTO_SETS` where
  the same file already carries it, so one file never has two descriptions.

`Adinkra.tsx` and `FilmFeature.tsx` are deleted; `adinkraGlyphs.tsx` and
`AdinkraCloth.tsx` are untouched.

### `#news` — News & Media

New `components/News.tsx`, merging `Updates.tsx` and `Media.tsx`.

- Updates from the store, newest first, capped at `HOME_LIMITS.updates` (3),
  with `UPDATES_INTRO`. When there are none, the updates block renders nothing
  and the press block still carries the section.
- `PRESS` items, including the DeoMetals banner, in declared order.
- `MEDIA_KIT` list and the link to `/media-kit`.

`Updates.tsx` and `Media.tsx` are deleted.

### `#gallery` — Gallery

New `components/Gallery.tsx`.

- Takes `content.gallery`, capped at `HOME_LIMITS.gallery` (9).
- Grid as today, with a **lightbox**: click opens the photograph large, focus
  moves in and is trapped, Escape closes, focus returns to the tile that
  opened it, arrow keys move between photographs. Same modal discipline the
  mobile nav overlay already uses, including `nav:lock` / `nav:unlock` so
  Lenis stops rather than scrolling behind the overlay.
- Under `prefers-reduced-motion: reduce` the lightbox opens without a
  transition.
- The gallery cannot be empty in practice: `baseContent()` seeds it from the
  six `GALLERY` constants, so a deployment with no store still has photographs.
  The nav link is therefore static like the other eight. The component keeps an
  empty guard anyway, because a store that has had every photograph deleted is
  reachable, and a heading standing over nothing is the bug this project
  already fixed once in `Kingdom`.

### `#contact` — Contact

`components/Contact.tsx`, from `Engage.tsx` plus `Faq.tsx` plus the contact
details currently in the footer.

- `id="contact"`, and **`id="engage"` on a wrapper inside it** so links
  already shared as `/#engage` still land. Fragment links cannot be
  redirected, so the old anchor has to keep existing.
- The four `ENGAGE_ROUTES`, the form, the honeypot, the requested-date field
  and every failure message: unchanged.
- Contact details through `contactValue()` — office address, email, phone,
  press, WhatsApp. Unsupplied values are omitted, not printed.
- `FAQ` accordion beneath.

The footer keeps the condensed contact lines it already carries. They are not
moved out of it: a footer is where a reader looks for them from any scroll
position, and both render from the same `ContactContext`, so they cannot
disagree.

`Faq.tsx` and `Engage.tsx` are deleted; the form markup moves wholesale rather
than being rewritten.

### Resulting page order

```
Hero
#about        About Nana
#chieftaincy  Chieftaincy & Leadership
#speeches     Speeches & Statements
#development  Community Development
#events       Events & Engagements
#culture      Traditional Culture
#news         News & Media
#gallery      Gallery
#contact      Contact
Footer
```

---

## Section 2 — Title block, nav and metadata

### `lib/content.ts`

```ts
export const CHIEF = {
  fullName: 'Nana Oyeadieyie Barima Essoun I',
  shortName: 'Nana Oyeadieyie',
  title: 'Nkosuo Hene of Adrobaa Traditional Authority',
  titleMeaning: 'Development Chief',
  authority: 'Adrobaa Traditional Authority',
  place: 'Adrobaa, Tano North',
  region: 'Ahafo Region, Ghana',
  strapline: ['Leadership', 'Service', 'Development', 'Tradition'],
  motto: 'Development for the People, By the People.',
};
```

`strapline` is an array, not a pre-joined string, so the separator is
presentation and the four words stay four words for a screen reader.

### Hero

```
NANA OYEADIEYIE BARIMA ESSOUN I     (wordmark treatment)
Nkosuo Hene of Adrobaa Traditional Authority
Leadership · Service · Development · Tradition

Preserving heritage.
Funding progress.

[Request an appearance]  [Media kit]
```

The strapline renders as a `<ul>`; the `·` separators are `aria-hidden`
pseudo-elements, never characters in the accessible name.

`HERO.eyebrow` currently holds `CHIEF.title`, which is now longer. On a phone
it must not wrap to three lines: the eyebrow steps down a size under `sm` and
the strapline wraps to two lines of two rather than four stacked words.

`HERO.sub` mentions "three continents", which the README already flags as
inferred. It is not touched here; it stays flagged.

### `NAV_LINKS`

```ts
export const NAV_LINKS = [
  { id: 'about',        label: 'About' },
  { id: 'chieftaincy',  label: 'Chieftaincy' },
  { id: 'speeches',     label: 'Speeches' },
  { id: 'development',  label: 'Development' },
  { id: 'events',       label: 'Events' },
  { id: 'culture',      label: 'Culture' },
  { id: 'news',         label: 'News' },
  { id: 'gallery',      label: 'Gallery' },
  { id: 'contact',      label: 'Contact' },
];
```

Labels are the brief's names shortened to the distinguishing word. The full
names are the section headings, where there is room for them.

Nine items is the real risk in the nav pill. Treatment:

- Links appear in the pill at `xl` and above with reduced tracking and a
  smaller step of horizontal padding.
- Between `lg` and `xl`, the pill shows the wordmark, the Request button and
  the hamburger; the nine live in the overlay.
- Below `lg`, unchanged from today.
- The overlay already numbers its links and traps focus. Nine fits.

If the pill still crowds at 1280, the breakpoint moves up rather than the type
going below 13px. Report it; do not shrink the text.

### Everything that carries the title

- `app/layout.tsx` — `metadata.title`, OpenGraph and Twitter titles,
  `description`.
- `app/page.tsx` — JSON-LD `WebSite.name` and `Person.jobTitle`.
- `components/Footer.tsx` — title line.
- `app/media-kit/page.tsx` — heading and biography intro.
- `lib/presskit.ts` — `ADDRESS` "First reference" becomes
  `Nana Oyeadieyie Barima Essoun I, Nkosuo Hene of Adrobaa Traditional
  Authority`. `BIO_SHORT` and `BIO_LONG` are **not** rewritten: they are
  approved text and describe the stool accurately as it stands.
- `app/manifest.ts`, `app/sitemap.ts` — checked for the title; no route
  changes.

The press kit ZIP embeds `ADDRESS`, so `node scripts/build-press-kit.mjs` is
re-run and `KIT` updated if the size changes.

---

## Section 3 — Removing the lens

Deleted:

- `components/LensContext.tsx`
- `byLens()`, `Lens` and `LensAffinity` from `lib/content.ts`
- every `lens:` field on `PILLARS`, `PROJECTS` and `PRESS`
- the lens toggle in `Nav.tsx`, its overlay labels, and `showLens`
- the lens branch in `Hero.tsx` (the subline becomes `HERO.sub`)
- `LensProvider` from `app/page.tsx`

`components/ContactContext.tsx` stays; it is unrelated.

The README's **The lens** chapter is replaced with a short note recording that
the lens existed, what it did, and that nine named sections replaced it — so
the next reader does not reinvent it.

---

## Section 4 — Statements in the store

### Type

```ts
export type Statement = {
  id: string;
  /* Optional. A statement the office posts has a date; the two seeded lines
     do not, because inventing a date for the chief's motto is exactly what
     this project refuses to do. Undated entries sort last. */
  date?: string;
  title: string;
  /* 'Enstoolment durbar, Adrobaa'. Optional. */
  occasion?: string;
  body: string;
  /* The line that carries the card, set in display type. Optional. */
  pullQuote?: string;
  imageUrl?: string;
  imageAlt?: string;
};
```

### Seed

`STATEMENTS` in `lib/content.ts`, two entries, both verbatim and both already
in the repository:

1. **The motto** — `CHIEF.motto`, as the pull-quote, occasion "In his own
   words", no date.
2. **The vision** — `TAGLINE`, as the body, occasion "In his own words", no
   date.

`baseContent()` returns `STATEMENTS` for `statements`, exactly as it already
does for `UPDATES`, `PROJECTS` and `IMPACT`. `readContent()` merges with
`parsed.statements ?? base.statements`.

### API

Three actions on `app/api/admin/content/route.ts`, following the existing
`add-update` / `set-update` / `delete-update` pattern precisely:

- `add-statement`, `set-statement`, `delete-statement`
- `clean()` caps: title 160, occasion 160, body 4000, pullQuote 300, alt 200,
  imageUrl 400
- `cleanDate()` applies, but an **empty date is valid** for a statement, unlike
  an update. Only a non-empty, unparseable date is rejected.
- `dropFileIfUnused()` gains `content.statements` to its reference count, so
  deleting a statement cannot pull a photograph out from under an update or an
  event that shares it.

### Admin

- Statements panel in `components/admin/ContentManager.tsx`, using the
  existing `AttachPhoto` component for imagery.
- Dashboard count in `app/admin/(protected)/page.tsx`.
- `HOME_LIMITS.statements = 3` in `lib/limits.ts`, with the same
  "past this point it is stored but not shown" marker the other lists carry.
- `lib/calendar.ts` gains kind `statement`, label **Stated**, note "A
  statement the office has published." Undated statements do not appear on the
  grid, because a calendar entry without a date is not one.

---

## Section 5 — Data flow

Unchanged in shape. `app/page.tsx` stays a server component with
`revalidate = 30`, calls `readContent()` once, and passes slices down:

```
readContent()
  ├─ content.statements → <Speeches statements={...} />
  ├─ content.projects   → <Development projects={...} impact={...} />
  ├─ content.impact     ┘
  ├─ content.events     → <Events events={...} />
  ├─ content.updates    → <News updates={...} />
  ├─ content.gallery    → <Gallery images={...} />
  └─ content.contact    → <ContactProvider>
```

`Gallery` now receives what `Kingdom` used to. `Chieftaincy` takes no props.

## Section 6 — Error handling

Nothing new. Every failure mode already has an owner:

- Store unreachable → `readContent()` returns `baseContent()`; the site renders
  from the build.
- No statements → the compiled lead still carries `#speeches`.
- No events → the section renders the engagement routes.
- No gallery → the section and its nav link are both omitted.
- No updates → the news section renders its press half.
- Unsupplied contact values → omitted by `contactValue()`.
- Form submission → unchanged; capture first, notify second.

## Section 7 — Verification

- `npm run build` clean; `npm run check:tokens` clean; `npx tsc --noEmit` clean.
- Playwright at **390px** and **1440px**:
  - every one of the nine anchors scrolls to a real section;
  - the nav active state changes correctly through all nine (this is the
    `threshold: 0` rule — a regression here is the documented Adrobaa/Projects
    bug returning);
  - no horizontal overflow at either width;
  - the hero video autoplays and the strapline sits on at most two lines;
  - the gallery lightbox opens, traps focus, closes on Escape and returns
    focus;
  - the adinkra glosses open on click.
- `prefers-reduced-motion: reduce` — no Lenis, no scrubbing, final states
  immediate, lightbox opens without transition.
- JavaScript off — page renders as static content, tagline is one sentence.
- `/#engage` still lands inside `#contact`.

## Section 8 — Out of scope

- New routes or archive pages. The README's note that older updates fall off
  with nowhere to go remains true and remains logged.
- Any change to the hero video, the press ZIP photography, or anything in
  `public/`.
- Confirming with the palace whether **Adrobaa Traditional Authority** is the
  authority's formal name. It is adopted on the office's written instruction
  and recorded in the README's open-questions table as needing confirmation.
