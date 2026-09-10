/* ---------------------------------------------------------------
   The record, compiled in.

   Everything here changes rarely and should go through review, so it lives
   in the repository rather than in the store. The store's seed comes from
   here too: on a deployment with no store connected, `baseContent()` returns
   these constants and the site renders exactly as it would have before there
   was an admin.

   There is no lens. The site used to carry a regal/modern control that
   reordered the page; nine named sections replaced it, because a reader who
   can see every subject by name does not need a control that reorders them.
--------------------------------------------------------------- */

export const CHIEF = {
  fullName: 'Nana Oyeadieyie Barima Essoun I',
  shortName: 'Nana Oyeadieyie',
  /* The office's own wording. The stool is Adrobaa; the authority is the
     traditional authority of Adrobaa, and the title names it in full. */
  title: 'Nkosuo Hene of Adrobaa Traditional Authority',
  /* The shorter form, for places where the full title will not fit on one
     line: the nav pill, a card, a caption. */
  titleShort: 'Nkosuo Hene of Adrobaa',
  titleMeaning: 'Development Chief',
  authority: 'Adrobaa Traditional Authority',
  place: 'Adrobaa, Tano North',
  region: 'Ahafo Region, Ghana',
  /* Four words, kept as four words rather than a joined string: the
     separators between them are presentation, and a screen reader should
     hear a list of four, not a sentence full of punctuation. */
  strapline: ['Leadership', 'Service', 'Development', 'Tradition'],
  /* The chief's own words. Do not paraphrase this line. */
  motto: 'Development for the People, By the People.',
};

export const COMPANY = {
  name: 'DeoMetals Ltd',
  group: 'A member of DGSC Group',
  promise: 'Trusted partner in precious metals and global trade',
  services: [
    'Licensed precious metals dealer',
    'Gold sourcing and purchasing',
    'Mining and refining operations',
    'Supply and export of minerals',
    'General trading and logistics',
    'Import and international distribution',
  ],
};

/* ---------------------------------------------------------------
   Hero
--------------------------------------------------------------- */
export const HERO = {
  headline: ['Preserving heritage.', 'Funding progress.'],
  sub: 'Nana Oyeadieyie Barima Essoun I sits as Development Chief of Adrobaa while running a licensed precious metals business across three continents. One office builds the stool. The other funds it.',
  primary: { label: 'Request an appearance', href: '/#engage' },
  secondary: { label: 'Media kit', href: '/media-kit' },
  proof: [
    'Enstooled Nkosuo Hene',
    'DeoMetals Ltd, DGSC Group',
    'Sanitation facility in construction at Adrobaa',
  ],
};

/* ---------------------------------------------------------------
   Dual profile
--------------------------------------------------------------- */
/**
 * The two offices he holds, side by side.
 *
 * These were once two tabs behind a regal/modern toggle, which meant a reader
 * who never touched the control saw only half of him. They now render as two
 * panels of one section, because the point the site is making is that the
 * commercial record and the development record are the same record.
 */
export const PROFILES = {
  stool: {
    key: 'stool' as const,
    heading: 'The stool of Adrobaa',
    lead: 'Enstooled as Nkosuo Hene, the Development Chief, with a mandate that is unusually literal: bring development to the town and answer for it.',
    image: '/img/chief-portrait.jpg',
    imageAlt:
      'Nana Oyeadieyie Barima Essoun I in green and gold kente with gold bracelets',
    facts: [
      {
        label: 'Title',
        value: 'Nkosuo Hene',
        note: 'The stool charged with attracting and delivering development',
      },
      {
        label: 'Stool',
        value: 'Adrobaa',
        note: 'Tano North Municipal, Ahafo Region',
      },
      {
        label: 'Council',
        value: 'Traditional council of Adrobaa',
        note: 'Projects are scoped with the elders before funds move',
      },
      {
        label: 'Duties',
        value: 'Durbars, festivals, arbitration, custom',
        note: 'The ceremonial calendar governs availability',
      },
    ],
  },
  business: {
    key: 'business' as const,
    heading: 'DeoMetals Ltd',
    lead: 'A licensed precious metals business covering sourcing, refining and export, operating as a member of DGSC Group. The commercial engine behind the development record.',
    image: '/img/exec-standing.jpg',
    imageAlt:
      'Nana Oyeadieyie Barima Essoun I standing at his desk in the office, in black dress and red cap',
    facts: [
      {
        label: 'Company',
        value: COMPANY.name,
        note: COMPANY.group,
      },
      {
        label: 'Licence',
        value: 'Precious metals dealer',
        note: 'Gold sourcing, purchasing and onward export',
      },
      {
        label: 'Operations',
        value: 'Mining and refining',
        note: 'Field operations through to refined product',
      },
      {
        label: 'Trade',
        value: 'Export, logistics, distribution',
        note: 'Minerals supply into international markets',
      },
    ],
  },
};

/* ---------------------------------------------------------------
   The statement. The lead of the Speeches & Statements chapter.
--------------------------------------------------------------- */
export const TAGLINE =
  'My vision is to empower the youth with skills and training, and to bring development to the communities. Development for the People, By the People.';

/* ---------------------------------------------------------------
   Speeches and statements
--------------------------------------------------------------- */

/**
 * Something the chief has said, on the record.
 *
 * `date` is optional, and that is deliberate. A statement the office posts
 * has a date, because it was made on a day. The entry seeded below has none:
 * it is his standing words rather than a speech given on an occasion, and
 * putting a date on it would be inventing one. Undated entries sort last and
 * never reach the admin calendar, because a calendar entry without a date is
 * not one.
 */
export type Statement = {
  id: string;
  date?: string;
  title: string;
  /* Where it was said. 'Enstoolment durbar, Adrobaa'. */
  occasion?: string;
  body: string;
  /* The line the card is built around, set in display type. */
  pullQuote?: string;
  imageUrl?: string;
  imageAlt?: string;
};

/**
 * The seed.
 *
 * Both of these are verbatim and both were already in this file. Nothing was
 * written for him: the first is `CHIEF.motto`, the second is `TAGLINE`, and
 * the office replaces or adds to them at /admin/content.
 */
export const STATEMENTS: Statement[] = [
  {
    id: 'seed-motto',
    title: 'The charge on the stool',
    occasion: 'In his own words',
    pullQuote: CHIEF.motto,
    body: 'The line he uses for the whole of it. Development is not something the town receives; it is something the town does, with the stool finding and funding the means.',
  },
];

/*
 * There is deliberately only one seeded entry.
 *
 * TAGLINE is the section's own lead, set large and scrubbed word by word.
 * Seeding it a second time as a card printed the identical sentence twice on
 * one screen — once at sixty pixels and once at sixteen — which is not a
 * record, it is a stutter. The motto survives as a card because the card says
 * something the lead does not: what the line means.
 */

/* ---------------------------------------------------------------
   The stool, in sequence. Drawn by components/Chieftaincy.tsx.
--------------------------------------------------------------- */
export const TIMELINE = [
  {
    id: 'stool',
    marker: 'The stool',
    title: 'Adrobaa and the Nkosuo stool',
    body: 'Adrobaa sits in Tano North Municipal in the Ahafo Region. The Nkosuo Hene is not an honorary seat. The holder is charged with development: finding it, funding it, and reporting back to the council.',
    image: '/img/kingdom-council.jpg',
    alt: 'Chiefs of Adrobaa seated in blue and gold kente during a council gathering',
  },
  {
    id: 'enstoolment',
    marker: 'Enstoolment',
    title: 'Enstooled as Nkosuo Hene',
    body: 'The ceremony placed him before the elders, the queen mothers and the town under the royal umbrella, in the black and gold adinkra cloth reserved for the occasion.',
    image: '/img/durbar-umbrella.jpg',
    alt: 'Nana Oyeadieyie Barima Essoun I beneath a black royal umbrella in adinkra cloth',
  },
  {
    id: 'council',
    marker: 'The court',
    title: 'Elders, queen mothers, custom',
    body: 'The traditional council convenes for durbars, festivals and arbitration. Decisions on land, custom and development pass through this court before anything is announced.',
    image: '/img/kingdom-queenmothers.jpg',
    alt: 'Queen mothers of Adrobaa in red and black cloth at a durbar',
  },
  {
    id: 'festival',
    marker: 'The calendar',
    title: 'Durbars and festivals',
    body: 'The ceremonial year sets the rhythm of the stool and governs when the chief can travel. Engagement requests are checked against this calendar first.',
    image: '/img/kingdom-festival.jpg',
    alt: 'Procession in green kente with gold ornaments during a festival at Adrobaa',
  },
];

export const GALLERY = [
  { src: '/img/kingdom-durbar.jpg', alt: 'Durbar of chiefs seated in brown adinkra regalia' },
  { src: '/img/procession-kente.jpg', alt: 'Procession in blue kente beneath the royal umbrella' },
  { src: '/img/kingdom-procession.jpg', alt: 'Chief carried in procession under a red umbrella' },
  { src: '/img/kingdom-walk.jpg', alt: 'Entourage walking to the durbar ground at Adrobaa' },
  { src: '/img/kingdom-seated.jpg', alt: 'Nana seated with a senior chief in black and gold cloth' },
  { src: '/img/kingdom-elders.jpg', alt: 'Nana seated with elders on the red carpet in kente' },
];

/* ---------------------------------------------------------------
   What the stool is for. Drawn beneath the timeline in Chieftaincy.
--------------------------------------------------------------- */
export const PILLARS: {
  id: string;
  title: string;
  body: string;
  icon: string;
}[] = [
  {
    id: 'youth',
    title: 'Youth with a trade in hand',
    body: 'Skills and training rather than encouragement. Five young people go to fashion school every year on the stool.',
    icon: 'users',
  },
  {
    id: 'education',
    title: 'Scholarships where ability outruns means',
    body: 'Support for brilliant but needy students, so that a place at school is decided by the pupil and not by the household budget.',
    icon: 'book',
  },
  {
    id: 'services',
    title: 'The basics a town is owed',
    body: 'Clean drinking water from mechanised boreholes, public sanitation, ring roads and street lights. Services people can point at.',
    icon: 'buildings',
  },
  {
    id: 'environment',
    title: 'A town that stays clean and green',
    body: 'Tree planting across the communities, and 150 dustbins already placed to keep the environment clean and hygienic.',
    icon: 'plant',
  },
];

/* ---------------------------------------------------------------
   Projects
--------------------------------------------------------------- */
export type ProjectStatus = 'Delivered' | 'Ongoing' | 'In construction' | 'Committed';

/**
 * What an image on this page actually is.
 *
 * `photo`        a photograph of the real work
 * `render`       an architect's visualisation of work not yet built
 * `illustration` a generated picture, standing in where no photograph exists
 *
 * The badge on every card is derived from this, so the page and the press kit
 * can never drift apart about what a reader is looking at. Only `photo` goes
 * unbadged, because only a photograph needs no qualification.
 */
export type Provenance = 'photo' | 'render' | 'illustration';

export const PROVENANCE_LABEL: Record<Provenance, string | null> = {
  photo: null,
  render: 'Render',
  illustration: 'Illustration',
};

/** One frame in a project's progress sequence. */
export type ProgressFrame = {
  src: string;
  alt: string;
  /* What the frame shows, in the fewest words that are still true. */
  caption: string;
  provenance: Provenance;
};
export type ProjectTag =
  | 'Sanitation'
  | 'Water'
  | 'Infrastructure'
  | 'Education'
  | 'Environment';

export const PROJECT_TAGS: ProjectTag[] = [
  'Sanitation',
  'Water',
  'Infrastructure',
  'Education',
  'Environment',
];

/**
 * The development record, as set out by the Nkosuo Hene himself.
 *
 * Spelling was corrected for publication; nothing else was changed. Where no
 * photograph exists yet the card carries an adinkra rather than a stand in
 * image, so nothing on this page implies evidence that is not there.
 *
 * `status` reflects his own phrasing. Anything he has not confirmed as
 * complete is left as Ongoing or Committed rather than promoted to Delivered.
 */
export const PROJECTS: {
  id: string;
  title: string;
  tag: ProjectTag;
  status: ProjectStatus;
  body: string;
  image?: string;
  alt?: string;
  glyph?: string;
  figure?: string;
  /* What the card image is. Absent means a photograph. */
  provenance?: Provenance;
  /* The work in sequence, where the photography exists to show it. */
  progress?: ProgressFrame[];
}[] = [
  {
    id: 'toilets',
    title: 'Public toilets, 20 seaters',
    tag: 'Sanitation',
    status: 'In construction',
    figure: '20 seaters',
    body: 'Public sanitation blocks of twenty seaters, sited around the communities. Taken from architectural render to poured foundation and blockwork on site.',
    image: '/img/project-sanitation-render.jpg',
    alt: 'Architectural render of a public sanitation block for Adrobaa at dusk',
    provenance: 'render',
    progress: [
      {
        src: '/img/project-sanitation-render2.jpg',
        alt: 'Architectural render of the sanitation block, front elevation, signed PUBLIC TOILET with separate male and female entrances',
        caption: 'The design, as drawn',
        provenance: 'render',
      },
      {
        src: '/img/project-foundation.jpg',
        alt: 'A workman standing beside freshly poured concrete foundation trenches in red earth',
        caption: 'Foundation trenches poured',
        provenance: 'photo',
      },
      {
        src: '/img/project-construction.jpg',
        alt: 'The completed foundation footprint of the block, its rooms laid out in concrete at ground level',
        caption: 'The footprint, room by room',
        provenance: 'photo',
      },
      {
        src: '/img/project-blockwork.jpg',
        alt: 'Site crew mixing concrete beside stacked blocks as the walls begin to rise',
        caption: 'Blockwork under way',
        provenance: 'photo',
      },
    ],
  },
  {
    id: 'water',
    title: 'Clean drinking water',
    tag: 'Water',
    status: 'Ongoing',
    body: 'Mechanised boreholes drilled in the communities. The rig, the casing and the first water are all on record, so the town can see the work rather than hear about it.',
    image: '/img/project-borehole-crew.jpg',
    alt: 'Drilling crew working the borehole rig in the community',
    progress: [
      {
        src: '/img/project-borehole-rig.jpg',
        alt: 'The drilling rig raised on site beside its supply truck, crew standing by',
        caption: 'The rig on site',
        provenance: 'photo',
      },
      {
        src: '/img/project-borehole-casing.jpg',
        alt: 'Casing pipes stacked in the back of the delivery truck at the community',
        caption: 'Casing delivered',
        provenance: 'photo',
      },
      {
        src: '/img/project-borehole-water.jpg',
        alt: 'Water running from the drill head into the pit at the moment the borehole is struck',
        caption: 'First water',
        provenance: 'photo',
      },
    ],
  },
  {
    id: 'dustbins',
    title: 'Clean community initiative',
    tag: 'Environment',
    status: 'Delivered',
    figure: '150 bins',
    body: 'About 150 dustbins placed at points across the communities to keep the environment clean and hygienic.',
    image: '/img/project-relief.jpg',
    alt: 'Women of Adrobaa receiving brooms and cleaning supplies for the community',
  },
  {
    id: 'roads',
    title: 'Street and ring roads',
    tag: 'Infrastructure',
    status: 'Committed',
    body: 'Ring roads through the community, opening the routes that carry produce, pupils and trade between the settlements.',
    image: '/img/project-groundbreaking.jpg',
    alt: 'Sod cutting to open works at Adrobaa, before the chiefs and queen mothers',
  },
  {
    id: 'lights',
    title: 'Street lights',
    tag: 'Infrastructure',
    status: 'Committed',
    body: 'Lighting along the community roads, so that the evening does not end movement, trade or safety in the town.',
    image: '/img/project-streetlights.jpg',
    alt: 'A solar street lamp beside a laterite road at dusk',
    provenance: 'illustration',
  },
  {
    id: 'scholarships',
    title: 'Scholarships for brilliant but needy students',
    tag: 'Education',
    status: 'Ongoing',
    body: 'Support for pupils whose ability outruns their means, so that a place at school is settled by the student and not by the household budget.',
    image: '/img/project-scholarships.jpg',
    alt: 'Senior high school students in uniform outside their classroom block, laughing together',
    provenance: 'illustration',
  },
  {
    id: 'skills',
    title: 'Youth skills and training',
    tag: 'Education',
    status: 'Ongoing',
    figure: '5 a year',
    body: 'Five young people are sent to fashion school every year on the stool, empowered with a trade they own rather than a promise they wait on.',
    image: '/img/community-youth.jpg',
    alt: 'Young people of Adrobaa on the community road',
  },
  {
    id: 'trees',
    title: 'Green nature initiative',
    tag: 'Environment',
    status: 'Ongoing',
    body: 'Tree planting across the communities, put in now for shade, soil and air that the town will use long after the planting is forgotten.',
    image: '/img/project-trees.jpg',
    alt: 'Rows of tree seedlings in nursery bags on red earth, ready for planting',
    provenance: 'illustration',
  },
];

/**
 * The impact counter.
 *
 * `attribution` says where a number comes from, and the section prints that
 * under the grid. `counted` figures are derived from the record on this page,
 * so they can never contradict the cards below them; `stated` figures are the
 * office's own, published as such rather than dressed up as audited.
 *
 * The projects tile previously read "10 projects delivered" while the record
 * below listed one delivered item. Deriving it from PROJECTS is what stops
 * that happening again: change the record, and the number follows.
 */
export const IMPACT: {
  id: string;
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  note: string;
  attribution: 'counted' | 'stated';
}[] = [
  {
    id: 'invested',
    value: 5,
    prefix: 'GHC ',
    suffix: 'm',
    label: 'Invested to date',
    note: 'Across delivered and committed projects',
    attribution: 'stated',
  },
  {
    id: 'lives',
    value: 50000,
    label: 'Residents reached',
    note: 'Adrobaa and surrounding communities',
    attribution: 'stated',
  },
  {
    id: 'projects',
    value: PROJECTS.length,
    label: 'Projects on the agenda',
    note: 'Delivered, under way and committed',
    attribution: 'counted',
  },
  {
    id: 'communities',
    value: 5,
    label: 'Communities served',
    note: 'Within Tano North Municipal',
    attribution: 'stated',
  },
];

/* Printed under the counter, so a reader always knows which numbers the page
   can prove and which the office has asserted. */
export const IMPACT_SOURCE =
  'Project count is taken from the record below. Investment, reach and community figures are as stated by the office of the Nkosuo Hene and are confirmed with the traditional council on request.';

/* ---------------------------------------------------------------
   Adinkra
--------------------------------------------------------------- */
export const ADINKRA: {
  id: string;
  name: string;
  meaning: string;
  gloss: string;
}[] = [
  {
    id: 'adinkrahene',
    name: 'Adinkrahene',
    meaning: 'Chief of the adinkra symbols',
    gloss: 'Greatness, charisma and leadership. Said to be the design from which the other symbols follow.',
  },
  {
    id: 'gyenyame',
    name: 'Gye Nyame',
    meaning: 'Except for God',
    gloss: 'The supremacy of God, and the most widely worn of all the symbols.',
  },
  {
    id: 'neaope',
    name: 'Nea Ope Se Obedi Hene',
    meaning: 'He who wants to be king',
    gloss: 'From the proverb that he who would be king must first learn to serve. Service comes before the stool, not after it.',
  },
  {
    id: 'dwennimmen',
    name: 'Dwennimmen',
    meaning: 'The horns of the ram',
    gloss: 'Humility together with strength. The ram fights fiercely but submits to slaughter, so strength need not be loud.',
  },
  {
    id: 'boame',
    name: 'Boa Me Na Me Mmoa Wo',
    meaning: 'Help me and let me help you',
    gloss: 'Cooperation and interdependence. Nothing on this page was built by one office alone.',
  },
  {
    id: 'neaonnim',
    name: 'Nea Onnim No Sua A, Ohu',
    meaning: 'He who does not know can know from learning',
    gloss: 'Knowledge and lifelong education. The pursuit of learning as a duty rather than a privilege.',
  },
  {
    id: 'akomantoso',
    name: 'Akoma Ntoso',
    meaning: 'Linked hearts',
    gloss: 'Understanding and agreement. The basis on which the council and the stool proceed.',
  },
  {
    id: 'akokonan',
    name: 'Akoko Nan',
    meaning: 'The leg of the hen',
    gloss: 'The hen treads on her chicks but does not kill them. Correction given in mercy, the mark of protective rule.',
  },
  {
    id: 'mpuannum',
    name: 'Mpuannum',
    meaning: 'Five tufts of hair',
    gloss: 'Loyalty, adroitness and priestly duty. A traditional hairstyle worn by those in service of the stool.',
  },
  {
    id: 'nkyinkyim',
    name: 'Nkyinkyim',
    meaning: 'The twisting path',
    gloss: 'Initiative, dynamism and versatility in the face of a road that turns.',
  },
];

/* ---------------------------------------------------------------
   Media
--------------------------------------------------------------- */
export const FILM = {
  src: '/video/enstoolment.mp4',
  poster: '/img/enstoolment-poster.jpg',
  kicker: 'The record',
  title: 'Enstoolment as Nkosuo Hene',
  body: 'The full ceremony at Adrobaa: the durbar ground laid out in red, the procession through the town beneath the royal umbrella, and the seating of the stool before the elders and queen mothers of Tano North.',
  alt: 'Procession through Adrobaa beneath the royal umbrella during the enstoolment',
  meta: ['Adrobaa, Tano North', 'Full ceremony', 'Broadcast quality on request'],
};

export const PRESS = [
  {
    id: 'award',
    kind: 'Photography',
    title: 'Recognitions and presentations',
    body: 'Award and plaque presentations received at the office, cleared for editorial use.',
    image: '/img/media-award.jpg',
    alt: 'Presentation of a plaque at the office of Nana Oyeadieyie',
  },
  {
    id: 'business',
    kind: 'Business',
    title: 'DeoMetals Ltd, precious metals and global trade',
    body: 'Company imagery covering the licence, the operations and the trade lines.',
    image: '/img/deometals-banner.jpg',
    alt: 'DeoMetals Ltd banner listing precious metals and trade services',
  },
];

export const MEDIA_KIT = [
  'Approved biography, long and short form',
  'High resolution photography, regalia and business dress',
  'Correct forms of address and title usage',
  'Enstoolment film, broadcast quality',
  'DeoMetals Ltd company summary',
];

/* ---------------------------------------------------------------
   FAQ
--------------------------------------------------------------- */
export const FAQ = [
  {
    q: 'What is a Nkosuo Hene?',
    a: 'The Development Chief. Where many stools are ceremonial, this one carries an explicit brief: attract development to the town, deliver it, and account for it to the traditional council.',
  },
  {
    q: 'Where is Adrobaa?',
    a: 'Adrobaa is in the Tano North Municipal district of the Ahafo Region, Ghana.',
  },
  {
    q: 'Is he available for engagements outside Ghana?',
    a: 'Yes. International engagements are accepted subject to the traditional calendar, which takes precedence over all other commitments.',
  },
  {
    q: 'Regalia or business dress?',
    a: 'Either. Full regalia carries protocol requirements around seating, procession and precedence, so state your preference when you request the appearance and the palace will confirm what is involved.',
  },
  {
    q: 'What does DeoMetals Ltd do?',
    a: 'DeoMetals Ltd is a licensed precious metals dealer and a member of DGSC Group. The business covers gold sourcing and purchasing, mining and refining operations, supply and export of minerals, general trading and logistics, and international distribution.',
  },
  {
    q: 'How do partners fund a development project?',
    a: 'Through the partnership route in the engage section. Every project is scoped with the traditional council before any funds move, and progress is photographed and published.',
  },
  {
    q: 'What is on the development agenda right now?',
    a: 'Public toilets of twenty seaters around the communities, mechanised boreholes for clean drinking water, ring roads and street lights, scholarships for brilliant but needy students, five youth placements into fashion school each year, tree planting, and about 150 dustbins already placed to keep the communities clean.',
  },
  {
    q: 'How much notice do you need?',
    a: 'Six weeks for international engagements and three weeks for engagements within Ghana. Shorter notice is sometimes possible outside festival season.',
  },
  {
    q: 'May press use the photography on this site?',
    a: 'Yes. Request the media kit and you will receive cleared high resolution files, approved biographies and guidance on correct title usage.',
  },
];

/* ---------------------------------------------------------------
   Engage
--------------------------------------------------------------- */
export const ENGAGE_ROUTES = [
  {
    id: 'appearance',
    title: 'Appearance and bookings',
    body: 'Conferences, launches, panels, durbars and state occasions.',
    primary: true,
  },
  {
    id: 'partnership',
    title: 'Partnership and investment',
    body: 'Corporate partners funding development work in Adrobaa and the wider Ahafo Region.',
    primary: false,
  },
  {
    id: 'diaspora',
    title: 'Diaspora support',
    body: 'For Ghanaians abroad contributing to named projects in the town.',
    primary: false,
  },
  {
    id: 'protocol',
    title: 'Protocol and courtesy calls',
    body: 'Formal visits to the palace, courtesy calls and traditional council matters.',
    primary: false,
  },
];

/**
 * Contact details for the office.
 *
 * A value left in brackets is not yet supplied by the palace. Nothing reads
 * these fields directly: everything goes through `contactValue()` below, which
 * returns null for an unsupplied value so the line is omitted rather than
 * printed. A missing contact line reads as reserve. A bracketed token reads as
 * an unfinished website, and this one is live.
 *
 * `whatsapp` is the number in international format with no punctuation, as
 * wa.me requires: 233XXXXXXXXX. Fill it and the WhatsApp route appears on its
 * own; leave it and nothing about the page suggests one exists.
 */
export const CONTACT = {
  office: 'Office of the Nkosuo Hene, Adrobaa, Tano North Municipal, Ahafo Region, Ghana',
  email: '[OFFICIAL EMAIL]',
  phone: '[OFFICIAL PHONE]',
  press: '[PRESS EMAIL]',
  whatsapp: '[WHATSAPP NUMBER]',
};

/** A bracketed value is a blank waiting on the palace, not a value. */
export function isSupplied(value: string | undefined): boolean {
  return Boolean(value) && !/^\[.*\]$/.test(value!.trim());
}

/** The value if the palace has supplied it, otherwise null. */
export function contactValue(
  key: keyof typeof CONTACT,
): string | null {
  const v = CONTACT[key];
  return isSupplied(v) ? v : null;
}

/* ---------------------------------------------------------------
   Updates
--------------------------------------------------------------- */

/**
 * Dated entries from the office.
 *
 * A development chief's authority is cumulative: the borehole that came in,
 * the durbar that happened, the students placed this year. Nothing else on
 * this site carries a date, so a second visit looks identical to the first
 * and regional press has nothing to cite.
 *
 * Add newest first. `date` is ISO so it sorts and machines can read it;
 * `image` is optional and should be a photograph, never a render. While this
 * array is empty the section renders nothing at all, so an empty archive is
 * never published.
 */
export type Update = {
  id: string;
  /* ISO date, YYYY-MM-DD. Displayed in full, e.g. 14 March 2026. */
  date: string;
  title: string;
  body: string;
  image?: string;
  alt?: string;
};

export const UPDATES: Update[] = [];

export const UPDATES_INTRO =
  'Work as it happens, dated and photographed, so the record can be checked rather than taken on trust.';

/** A date the office typed, or null if it is not one. */
export function parseISODate(iso: string | undefined): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Never throws.
 *
 * `Intl.DateTimeFormat().format()` raises RangeError on an invalid date, and
 * this runs inside a server component on the public home page — so one bad
 * date reaching the store took the whole site down. It now prints whatever it
 * was given rather than bringing the page with it.
 */
export function formatUpdateDate(iso: string): string {
  const d = parseISODate(iso);
  if (!d) return iso ?? '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

/**
 * The nine sections, in reading order.
 *
 * `label` is what the nav shows and `name` is the section's full name, used
 * as its heading. The nav needs the short form because nine items have to sit
 * in one pill; the page has room for the whole thing.
 *
 * `numeral` is the chapter mark. The record reads as nine chapters, and the
 * numerals are Roman because the stool's holder is Essoun the First — the
 * device belongs to this office and would be borrowed anywhere else.
 */
export const NAV_LINKS = [
  { id: 'about', label: 'About', name: 'About Nana', numeral: 'I' },
  { id: 'chieftaincy', label: 'Chieftaincy', name: 'Chieftaincy & Leadership', numeral: 'II' },
  { id: 'speeches', label: 'Speeches', name: 'Speeches & Statements', numeral: 'III' },
  { id: 'development', label: 'Development', name: 'Community Development', numeral: 'IV' },
  { id: 'events', label: 'Events', name: 'Events & Engagements', numeral: 'V' },
  { id: 'culture', label: 'Culture', name: 'Traditional Culture', numeral: 'VI' },
  { id: 'news', label: 'News', name: 'News & Media', numeral: 'VII' },
  { id: 'gallery', label: 'Gallery', name: 'Gallery', numeral: 'VIII' },
  { id: 'contact', label: 'Contact', name: 'Contact', numeral: 'IX' },
] as const;

export type SectionId = (typeof NAV_LINKS)[number]['id'];

/** The chapter mark and full name for one section, by id. */
export function chapter(id: SectionId) {
  const found = NAV_LINKS.find((l) => l.id === id);
  if (!found) throw new Error(`Unknown section: ${id}`);
  return found;
}

/* Absolute so the link works from /media-kit as well as the home page. On the
   home page the browser still treats it as a same document fragment jump. */
export const sectionHref = (id: string) => `/#${id}`;
