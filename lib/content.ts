export type Lens = 'regal' | 'modern';

/**
 * Which lens a piece of content leads under.
 *
 * `regal` is the stool: custom, community, the people-facing work.
 * `modern` is the commercial engine: engineering, infrastructure, trade.
 * Nothing is ever hidden, only reordered, so the page never conceals part of
 * the record from a reader who does not touch the control.
 */
export type LensAffinity = Lens;

export function byLens<T extends { lens?: LensAffinity }>(
  items: T[],
  lens: Lens,
): T[] {
  return [...items].sort((a, b) => {
    const av = a.lens === lens ? 0 : 1;
    const bv = b.lens === lens ? 0 : 1;
    return av - bv;
  });
}

export const CHIEF = {
  fullName: 'Nana Oyeadieyie Barima Essoun I',
  shortName: 'Nana Oyeadieyie',
  title: 'Nkosuo Hene of Adrobaa',
  titleMeaning: 'Development Chief',
  place: 'Adrobaa, Tano North',
  region: 'Ahafo Region, Ghana',
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
  /* Kept to one line on a phone. Wide tracking makes an eyebrow long fast,
     and the region already appears in the subline and the proof row. */
  eyebrow: CHIEF.title,
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
export const PROFILES = {
  regal: {
    key: 'regal' as const,
    tab: 'The Ruler',
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
  modern: {
    key: 'modern' as const,
    tab: 'The Executive',
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
   B11 tagline reveal
--------------------------------------------------------------- */
export const TAGLINE =
  'My vision is to empower the youth with skills and training, and to bring development to the communities. Development for the People, By the People.';

/* ---------------------------------------------------------------
   Kingdom timeline
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
   Vision pillars
--------------------------------------------------------------- */
export const PILLARS: {
  id: string;
  lens?: LensAffinity;
  title: string;
  body: string;
  icon: string;
}[] = [
  {
    id: 'youth',
    lens: 'modern',
    title: 'Youth with a trade in hand',
    body: 'Skills and training rather than encouragement. Five young people go to fashion school every year on the stool.',
    icon: 'users',
  },
  {
    id: 'education',
    lens: 'regal',
    title: 'Scholarships where ability outruns means',
    body: 'Support for brilliant but needy students, so that a place at school is decided by the pupil and not by the household budget.',
    icon: 'book',
  },
  {
    id: 'services',
    lens: 'modern',
    title: 'The basics a town is owed',
    body: 'Clean drinking water from mechanised boreholes, public sanitation, ring roads and street lights. Services people can point at.',
    icon: 'buildings',
  },
  {
    id: 'environment',
    lens: 'regal',
    title: 'A town that stays clean and green',
    body: 'Tree planting across the communities, and 150 dustbins already placed to keep the environment clean and hygienic.',
    icon: 'plant',
  },
];

/* ---------------------------------------------------------------
   Projects
--------------------------------------------------------------- */
export type ProjectStatus = 'Delivered' | 'Ongoing' | 'In construction' | 'Committed';
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
  lens?: LensAffinity;
  tag: ProjectTag;
  status: ProjectStatus;
  body: string;
  image?: string;
  alt?: string;
  glyph?: string;
  figure?: string;
  /* True when the image is a generated illustration rather than a photograph
     of the work. It is labelled on the card so nothing on this page can be
     mistaken for documentary evidence. */
  illustration?: boolean;
}[] = [
  {
    id: 'toilets',
    title: 'Public toilets, 20 seaters',
    lens: 'regal',
    tag: 'Sanitation',
    status: 'In construction',
    figure: '20 seaters',
    body: 'Public sanitation blocks of twenty seaters, sited around the communities. Taken from architectural render to poured foundation and blockwork on site.',
    image: '/img/project-sanitation-render.jpg',
    alt: 'Architectural render of a public sanitation block for Adrobaa at dusk',
  },
  {
    id: 'water',
    title: 'Clean drinking water',
    lens: 'modern',
    tag: 'Water',
    status: 'Ongoing',
    body: 'Mechanised boreholes drilled in the communities. The rig, the casing and the first water are all on record, so the town can see the work rather than hear about it.',
    image: '/img/project-borehole-crew.jpg',
    alt: 'Drilling crew working the borehole rig in the community',
  },
  {
    id: 'dustbins',
    title: 'Clean community initiative',
    lens: 'regal',
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
    lens: 'modern',
    tag: 'Infrastructure',
    status: 'Committed',
    body: 'Ring roads through the community, opening the routes that carry produce, pupils and trade between the settlements.',
    image: '/img/project-groundbreaking.jpg',
    alt: 'Sod cutting to open works at Adrobaa, before the chiefs and queen mothers',
  },
  {
    id: 'lights',
    title: 'Street lights',
    lens: 'modern',
    tag: 'Infrastructure',
    status: 'Committed',
    body: 'Lighting along the community roads, so that the evening does not end movement, trade or safety in the town.',
    image: '/img/project-streetlights.jpg',
    alt: 'A solar street lamp beside a laterite road at dusk',
    illustration: true,
  },
  {
    id: 'scholarships',
    title: 'Scholarships for brilliant but needy students',
    lens: 'regal',
    tag: 'Education',
    status: 'Ongoing',
    body: 'Support for pupils whose ability outruns their means, so that a place at school is settled by the student and not by the household budget.',
    image: '/img/project-scholarships.jpg',
    alt: 'Senior high school students in uniform outside their classroom block, laughing together',
    illustration: true,
  },
  {
    id: 'skills',
    title: 'Youth skills and training',
    lens: 'modern',
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
    lens: 'regal',
    tag: 'Environment',
    status: 'Ongoing',
    body: 'Tree planting across the communities, put in now for shade, soil and air that the town will use long after the planting is forgotten.',
    image: '/img/project-trees.jpg',
    alt: 'Rows of tree seedlings in nursery bags on red earth, ready for planting',
    illustration: true,
  },
];

/* Impact counter. Values intentionally bracketed until the palace supplies
   audited figures. Nothing false ships on an official site. */
export const IMPACT: {
  id: string;
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  note: string;
}[] = [
  {
    id: 'invested',
    value: 5,
    prefix: 'GHC ',
    suffix: 'm',
    label: 'Invested to date',
    note: 'Across delivered and committed projects',
  },
  {
    id: 'lives',
    value: 50000,
    label: 'Residents reached',
    note: 'Adrobaa and surrounding communities',
  },
  {
    id: 'projects',
    value: 10,
    label: 'Projects delivered',
    note: 'Completed and handed to the town',
  },
  {
    id: 'communities',
    value: 5,
    label: 'Communities served',
    note: 'Within Tano North Municipal',
  },
];

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
    lens: 'regal' as const,
    kind: 'Photography',
    title: 'Recognitions and presentations',
    body: 'Award and plaque presentations received at the office, cleared for editorial use.',
    image: '/img/media-award.jpg',
    alt: 'Presentation of a plaque at the office of Nana Oyeadieyie',
  },
  {
    id: 'business',
    lens: 'modern' as const,
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
    cta: 'Request an appearance',
    primary: true,
  },
  {
    id: 'partnership',
    title: 'Partnership and investment',
    body: 'Corporate partners funding development work in Adrobaa and the wider Ahafo Region.',
    cta: 'Open a partnership conversation',
    primary: false,
  },
  {
    id: 'diaspora',
    title: 'Diaspora support',
    body: 'For Ghanaians abroad contributing to named projects in the town.',
    cta: 'Support a project',
    primary: false,
  },
  {
    id: 'protocol',
    title: 'Protocol and courtesy calls',
    body: 'Formal visits to the palace, courtesy calls and traditional council matters.',
    cta: 'Request protocol guidance',
    primary: false,
  },
];

export const CONTACT = {
  office: 'Office of the Nkosuo Hene, Adrobaa, Tano North Municipal, Ahafo Region, Ghana',
  email: '[OFFICIAL EMAIL]',
  phone: '[OFFICIAL PHONE]',
  press: '[PRESS EMAIL]',
};

export const NAV_LINKS = [
  { id: 'ruler', label: 'The Ruler' },
  { id: 'kingdom', label: 'Adrobaa' },
  { id: 'vision', label: 'Vision' },
  { id: 'projects', label: 'Projects' },
  { id: 'media', label: 'Media' },
  { id: 'engage', label: 'Engage' },
];

/* Absolute so the link works from /media-kit as well as the home page. On the
   home page the browser still treats it as a same document fragment jump. */
export const sectionHref = (id: string) => `/#${id}`;
