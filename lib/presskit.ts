/* Rebuilt by scripts/build-press-kit.mjs, which reads PHOTO_SETS below, so
   the pack and the page can never list different photographs. Run it and
   paste the size and count it prints back here. */
export const KIT = {
  file: '/press/adrobaa-press-kit.zip',
  size: '9.1 MB',
  count: '21 images',
};

/* Protocol matters more to a traditional office than to a company, and getting
   it wrong in print is the thing most likely to cause offence. */
export const ADDRESS = [
  {
    label: 'First reference',
    value:
      'Nana Oyeadieyie Barima Essoun I, Nkosuo Hene of Adrobaa Traditional Authority',
  },
  { label: 'Later references', value: 'Nana Oyeadieyie' },
  { label: 'In direct address', value: 'Nana' },
];

export const ADDRESS_NOTE =
  'Nana is the honorific and is never dropped. Nkosuo Hene translates as Development Chief: the stool charged with attracting development to the town and accounting for it to the traditional council. It is not an honorary title. Confirm spellings with the office before publication.';

export const BIO_SHORT =
  "Nana Oyeadieyie Barima Essoun I is the Nkosuo Hene, or Development Chief, of Adrobaa in the Tano North Municipal district of Ghana's Ahafo Region. He is also a licensed precious metals dealer, running DeoMetals Ltd, a member of DGSC Group, whose trade underwrites his development work in the town.";

export const BIO_LONG = `Nana Oyeadieyie Barima Essoun I holds the Nkosuo stool of Adrobaa in Tano North Municipal, Ahafo Region. Where many traditional seats are ceremonial, the Nkosuo Hene carries an explicit brief: attract development to the town, deliver it, and account for it to the traditional council.

He pursues that brief on two fronts. As a chief he sits with the elders and queen mothers of Adrobaa, presides at durbars and festivals, and scopes every project with the council before funds move. As an executive he runs DeoMetals Ltd, a member of DGSC Group and a licensed precious metals dealer covering gold sourcing and purchasing, mining and refining operations, supply and export of minerals, trading, logistics and international distribution.

His stated agenda covers public sanitation, mechanised boreholes for clean drinking water, ring roads and street lighting, scholarships for brilliant but needy students, youth skills training, tree planting and community cleanliness. His own words for it: Development for the People, By the People.`;

export type Shot = { src: string; name: string; alt: string; note?: string };

export const PHOTO_SETS: { id: string; title: string; body: string; shots: Shot[] }[] = [
  {
    id: 'regalia',
    title: 'Regalia and traditional office',
    body: 'Durbar, procession and council imagery. Use these where the story concerns the stool.',
    shots: [
      {
        src: '/img/durbar-umbrella.jpg',
        name: 'nana-oyeadieyie-regalia-umbrella.jpg',
        alt: 'Nana Oyeadieyie Barima Essoun I in adinkra cloth beneath the royal umbrella',
      },
      {
        src: '/img/chief-portrait.jpg',
        name: 'nana-oyeadieyie-kente-portrait.jpg',
        alt: 'Studio portrait in green and gold kente with gold bracelets',
      },
      {
        src: '/img/procession-kente.jpg',
        name: 'nana-oyeadieyie-procession.jpg',
        alt: 'Procession in blue kente beneath the royal umbrella',
      },
      {
        src: '/img/kingdom-council.jpg',
        name: 'adrobaa-traditional-council.jpg',
        alt: 'Chiefs of Adrobaa seated in council',
      },
      {
        src: '/img/media-formal.jpg',
        name: 'nana-oyeadieyie-seated-kente.jpg',
        alt: 'Seated in blue and gold kente beneath the ceremonial umbrella, with family and attendants',
      },
    ],
  },
  {
    id: 'business',
    title: 'Business and DeoMetals Ltd',
    body: 'For coverage of the commercial side: the licence, the operations and the trade lines.',
    shots: [
      {
        src: '/img/exec-deometals-desk.jpg',
        name: 'nana-oyeadieyie-deometals-field.jpg',
        alt: 'In DeoMetals field uniform reviewing documents at his desk',
      },
      {
        src: '/img/exec-standing.jpg',
        name: 'nana-oyeadieyie-office-portrait.jpg',
        alt: 'Standing portrait in the office',
      },
      {
        src: '/img/deometals-banner.jpg',
        name: 'deometals-services.jpg',
        alt: 'DeoMetals Ltd banner listing its services',
      },
      {
        src: '/img/exec-office.jpg',
        name: 'nana-oyeadieyie-office-desk.jpg',
        alt: 'Standing at the office desk in black dress and red cap',
      },
      {
        src: '/img/exec-travel.jpg',
        name: 'nana-oyeadieyie-travel.jpg',
        alt: 'Travelling on business for DeoMetals Ltd',
      },
      {
        src: '/img/global-paris.jpg',
        name: 'nana-oyeadieyie-international.jpg',
        alt: 'Abroad on the international trade lines',
      },
      {
        src: '/img/media-presentation.jpg',
        name: 'nana-oyeadieyie-plaque-presentation.jpg',
        alt: 'Receiving a plaque at the office with colleagues',
      },
    ],
  },
  {
    id: 'development',
    title: 'The development record',
    body: 'Work in progress and delivered. Every frame here is a photograph of the actual work.',
    shots: [
      {
        src: '/img/project-borehole-crew.jpg',
        name: 'borehole-drilling.jpg',
        alt: 'Drilling crew working the borehole rig',
      },
      {
        src: '/img/project-groundbreaking.jpg',
        name: 'groundbreaking-adrobaa.jpg',
        alt: 'Sod cutting before the chiefs and queen mothers',
      },
      {
        src: '/img/project-relief.jpg',
        name: 'community-cleanliness-distribution.jpg',
        alt: 'Women of Adrobaa receiving brooms and cleaning supplies',
      },
      {
        src: '/img/project-sanitation-render.jpg',
        name: 'sanitation-facility-render.jpg',
        alt: 'Architectural render of the public sanitation facility',
        note: 'Render, not a photograph',
      },
      {
        src: '/img/project-sanitation-aerial.jpg',
        name: 'sanitation-facility-render-aerial.jpg',
        alt: 'Architectural render of the sanitation facility seen from above',
        note: 'Render, not a photograph',
      },
      {
        src: '/img/project-foundation.jpg',
        name: 'sanitation-foundation-poured.jpg',
        alt: 'Freshly poured concrete foundation trenches on the sanitation site',
      },
      {
        src: '/img/project-blockwork.jpg',
        name: 'sanitation-blockwork.jpg',
        alt: 'Site crew mixing concrete as the walls of the sanitation block rise',
      },
      {
        src: '/img/project-commissioning.jpg',
        name: 'sod-cutting-ceremony.jpg',
        alt: 'Cutting the sod before elders and queen mothers to open works',
      },
      {
        src: '/img/project-community.jpg',
        name: 'community-gathering.jpg',
        alt: 'Chiefs, queen mothers and residents gathered on site under the umbrella',
      },
    ],
  },
];

export const KIT_TERMS = [
  'Editorial use is cleared for material in this pack.',
  'Credit as: Office of the Nkosuo Hene of Adrobaa.',
  'Commercial use requires written permission from the office.',
  'Follow the forms of address above. Traditional titles carry protocol.',
  'Images marked as a render are not photographs of completed work.',
];
