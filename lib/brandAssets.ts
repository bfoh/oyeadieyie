import { CHIEF, COMPANY, CONTACT, contactValue } from './content';

/**
 * The brand engine.
 *
 * Every asset the office actually has to hand somebody: paper that goes out
 * under the stool's name, ceremonial material for durbars and presentations,
 * and the digital marks that carry the same identity into a phone.
 *
 * Each asset declares the fields the office fills in and the sheet it prints
 * on. The preview is rendered live in the browser from the same values, so
 * what is downloaded is what was seen. Nothing here is a stock template: the
 * palette, the adinkra and the forms of address are this office's own.
 */

export type FieldType = 'text' | 'textarea' | 'date' | 'select' | 'photo';

/**
 * The photographs cleared for brand use.
 *
 * A short, curated set rather than the whole gallery: these are the frames
 * that carry the office well at small sizes and in print. Each says which
 * shape it is cut for, so the picker never offers a wide banner where a
 * portrait belongs.
 */
export type BrandPhoto = {
  id: string;
  src: string;
  label: string;
  alt: string;
  shape: 'portrait' | 'head' | 'wide';
};

export const BRAND_PHOTOS: BrandPhoto[] = [
  {
    id: 'regalia',
    src: '/img/brand/portrait-regalia.jpg',
    label: 'In kente',
    alt: 'Nana Oyeadieyie Barima Essoun I in green and gold kente with gold bracelets',
    shape: 'portrait',
  },
  {
    id: 'durbar',
    src: '/img/brand/portrait-durbar.jpg',
    label: 'Beneath the umbrella',
    alt: 'Nana Oyeadieyie Barima Essoun I in black and gold adinkra cloth beneath the royal umbrella',
    shape: 'portrait',
  },
  {
    id: 'office',
    src: '/img/brand/portrait-office.jpg',
    label: 'At the office',
    alt: 'Nana Oyeadieyie Barima Essoun I standing at his desk in black dress and red cap',
    shape: 'portrait',
  },
  {
    id: 'head-office',
    src: '/img/brand/head-office.jpg',
    label: 'Headshot, business dress',
    alt: 'Portrait of Nana Oyeadieyie Barima Essoun I in a red cap',
    shape: 'head',
  },
  {
    id: 'head-regalia',
    src: '/img/brand/head-regalia.jpg',
    label: 'Headshot, in kente',
    alt: 'Portrait of Nana Oyeadieyie Barima Essoun I in kente',
    shape: 'head',
  },
  {
    id: 'court',
    src: '/img/brand/wide-court.jpg',
    label: 'The court seated',
    alt: 'Nana Oyeadieyie Barima Essoun I seated with a senior chief in adinkra cloth',
    shape: 'wide',
  },
  {
    id: 'procession',
    src: '/img/brand/wide-durbar.jpg',
    label: 'The procession',
    alt: 'Procession beneath the royal umbrella at Adrobaa',
    shape: 'wide',
  },
];

export function photosOfShape(shape: BrandPhoto['shape']) {
  return BRAND_PHOTOS.filter((p) => p.shape === shape);
}

export function findPhoto(id: string): BrandPhoto | null {
  return BRAND_PHOTOS.find((p) => p.id === id) ?? null;
}

export type AssetField = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  default?: string;
  options?: string[];
  /* Roughly how long the value can be before the design stops holding it. */
  max?: number;
  /* For a photo field: which cuts this frame can actually take. A circular
     crop needs a headshot — a wide procession shot reduced to a circle is a
     sliver of a scene and nobody's face. Offering all seven frames in every
     slot, which is what the picker did, invited exactly that. */
  shapes?: BrandPhoto['shape'][];
  help?: string;
};

export type AssetFormat = 'PNG' | 'PDF';

export type BrandAsset = {
  id: string;
  category: 'stationery' | 'ceremonial' | 'digital';
  title: string;
  body: string;
  /* Printed dimensions in millimetres, or pixels for screen assets. */
  sheet: { w: number; h: number; unit: 'mm' | 'px'; label: string };
  formats: AssetFormat[];
  fields: AssetField[];
};

export const ASSET_CATEGORIES: {
  id: BrandAsset['category'];
  label: string;
  eyebrow: string;
}[] = [
  { id: 'stationery', label: 'Stationery', eyebrow: 'Paper of the stool' },
  { id: 'ceremonial', label: 'Ceremonial', eyebrow: 'Durbar and protocol' },
  { id: 'digital', label: 'Digital', eyebrow: 'Screens and press' },
];

/* Values that recur across assets, taken from the site's own content so the
   hub and the public page can never disagree about the office's details. */
export const BRAND = {
  chief: CHIEF.fullName,
  shortName: CHIEF.shortName,
  title: CHIEF.title,
  titleMeaning: CHIEF.titleMeaning,
  place: CHIEF.place,
  region: CHIEF.region,
  motto: CHIEF.motto,
  office: CONTACT.office,
  company: COMPANY.name,
  group: COMPANY.group,
  get email() {
    return contactValue('email');
  },
  get phone() {
    return contactValue('phone');
  },
  get press() {
    return contactValue('press');
  },
};

const NAME_FIELD: AssetField = {
  key: 'name',
  label: 'Name',
  type: 'text',
  default: CHIEF.fullName,
  max: 46,
};

export const BRAND_ASSETS: BrandAsset[] = [
  /* ---------------------------------------------------------------
     Stationery
  --------------------------------------------------------------- */
  {
    id: 'letterhead',
    category: 'stationery',
    title: 'Letterhead',
    body: 'A4 paper for correspondence issued under the stool, with the crest, the full style of address and the office footer.',
    sheet: { w: 210, h: 297, unit: 'mm', label: 'A4 portrait' },
    formats: ['PDF', 'PNG'],
    fields: [
      { key: 'recipient', label: 'Addressed to', type: 'text', placeholder: 'The Municipal Chief Executive', max: 60 },
      { key: 'subject', label: 'Subject line', type: 'text', placeholder: 'Sanitation facility at Adrobaa', max: 70 },
      { key: 'date', label: 'Date', type: 'date' },
      {
        key: 'bodyText',
        label: 'Body',
        type: 'textarea',
        placeholder: 'Leave empty to print blank paper for handwriting or a printer.',
        /* The A4 sheet is a fixed canvas and html-to-image exports exactly
           what fits on it, so anything past the foot of the page is silently
           absent from the PDF. Roughly what an A4 letter holds beneath the
           letterhead block. */
        max: 1800,
        help: 'Blank prints a clean sheet, which is what most offices want. About a page at most.',
      },
    ],
  },
  {
    id: 'calling-card',
    category: 'stationery',
    title: 'Calling card',
    body: 'The card handed across at a courtesy call. Traditional style on the front, the commercial office on the reverse.',
    sheet: { w: 85, h: 55, unit: 'mm', label: '85 × 55 mm' },
    formats: ['PNG', 'PDF'],
    fields: [
      NAME_FIELD,
      { key: 'style', label: 'Style of address', type: 'text', default: CHIEF.title, max: 40 },
      { key: 'line', label: 'Second line', type: 'text', default: `${COMPANY.name}, ${COMPANY.group.replace(/^A member/, 'a member')}`, max: 52 },
      { key: 'side', label: 'Face', type: 'select', options: ['Front', 'Reverse'], default: 'Front' },
      { key: 'photo', label: 'Portrait', type: 'photo', default: 'head-regalia', shapes: ['head'], help: 'Shown on the front in a gold circle, so a headshot only.' },
    ],
  },
  {
    id: 'compliment-slip',
    category: 'stationery',
    title: 'With compliments',
    body: 'The slip that travels with a gift, a document or a donation from the office.',
    sheet: { w: 210, h: 99, unit: 'mm', label: '210 × 99 mm' },
    formats: ['PDF', 'PNG'],
    fields: [
      { key: 'note', label: 'Note', type: 'text', placeholder: 'With the compliments of the Nkosuo Hene', max: 60 },
    ],
  },
  {
    id: 'envelope',
    category: 'stationery',
    title: 'Envelope',
    body: 'DL envelope carrying the crest and the return address of the palace.',
    sheet: { w: 220, h: 110, unit: 'mm', label: 'DL 220 × 110 mm' },
    formats: ['PDF'],
    fields: [
      { key: 'addressee', label: 'Addressee', type: 'textarea', placeholder: 'Leave blank to print the return address only.', max: 200 },
    ],
  },

  /* ---------------------------------------------------------------
     Ceremonial
  --------------------------------------------------------------- */
  {
    id: 'durbar-invitation',
    category: 'ceremonial',
    title: 'Durbar invitation',
    body: 'The card that summons chiefs, queen mothers and guests to a durbar or festival at Adrobaa.',
    sheet: { w: 148, h: 210, unit: 'mm', label: 'A5 portrait' },
    formats: ['PDF', 'PNG'],
    fields: [
      { key: 'occasion', label: 'Occasion', type: 'text', default: 'Durbar of Chiefs', max: 40 },
      { key: 'guest', label: 'Guest', type: 'text', placeholder: 'Nana Kwabena Owusu', max: 44 },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time', type: 'text', default: '10:00 prompt', max: 24 },
      { key: 'venue', label: 'Venue', type: 'text', default: 'The durbar ground, Adrobaa', max: 46 },
      { key: 'dress', label: 'Dress', type: 'text', default: 'Traditional cloth', max: 34 },
      { key: 'photo', label: 'Portrait', type: 'photo', default: 'durbar', shapes: ['portrait', 'wide'], help: 'Set behind the card, quietened so the type stays first.' },
    ],
  },
  {
    id: 'citation',
    category: 'ceremonial',
    title: 'Citation',
    body: 'The citation read and presented when the stool honours a person or an institution.',
    sheet: { w: 297, h: 210, unit: 'mm', label: 'A4 landscape' },
    formats: ['PDF', 'PNG'],
    fields: [
      { key: 'honouree', label: 'Presented to', type: 'text', placeholder: 'Madam Akosua Mensah', max: 40 },
      { key: 'reason', label: 'In recognition of', type: 'textarea', placeholder: 'distinguished service to the people of Adrobaa', max: 220 },
      { key: 'date', label: 'Date', type: 'date' },
    ],
  },
  {
    id: 'project-board',
    category: 'ceremonial',
    title: 'Project signboard',
    body: 'The board that stands at a site so the town can read what is being built, by whom, and when it is due.',
    sheet: { w: 1200, h: 800, unit: 'px', label: '3 × 2 site board' },
    formats: ['PNG', 'PDF'],
    fields: [
      { key: 'project', label: 'Project', type: 'text', default: 'Public sanitation facility, 20 seaters', max: 52 },
      { key: 'location', label: 'Location', type: 'text', default: 'Adrobaa, Tano North', max: 40 },
      { key: 'status', label: 'Status', type: 'select', options: ['In construction', 'Ongoing', 'Delivered', 'Committed'], default: 'In construction' },
      { key: 'funder', label: 'Funded by', type: 'text', default: 'The Office of the Nkosuo Hene', max: 44 },
      { key: 'completion', label: 'Expected completion', type: 'text', placeholder: 'December 2026', max: 26 },
    ],
  },
  {
    id: 'programme',
    category: 'ceremonial',
    title: 'Order of proceedings',
    body: 'The printed order for a durbar or presentation, so the high table and the town follow the same sequence.',
    sheet: { w: 148, h: 210, unit: 'mm', label: 'A5 portrait' },
    formats: ['PDF'],
    fields: [
      { key: 'occasion', label: 'Occasion', type: 'text', default: 'Durbar of Chiefs', max: 40 },
      { key: 'date', label: 'Date', type: 'date' },
      {
        key: 'items',
        label: 'Order of proceedings',
        type: 'textarea',
        default:
          'Arrival and seating of guests\nProcession of chiefs\nOpening prayer\nWelcome address\nAddress by the Nkosuo Hene\nPresentation of projects\nDonations and pledges\nClosing prayer\nDeparture of chiefs',
        max: 900,
        help: 'One item per line. About sixteen lines before the programme runs off the page.',
      },
    ],
  },

  /* ---------------------------------------------------------------
     Digital
  --------------------------------------------------------------- */
  {
    id: 'email-signature',
    category: 'digital',
    title: 'Email signature',
    body: 'The block that closes every message from the office, with the correct style of address already set.',
    sheet: { w: 620, h: 200, unit: 'px', label: '620 × 200 px' },
    formats: ['PNG'],
    fields: [
      NAME_FIELD,
      { key: 'style', label: 'Style of address', type: 'text', default: `${CHIEF.title}, the ${CHIEF.titleMeaning}`, max: 52 },
      { key: 'contact', label: 'Contact line', type: 'text', placeholder: 'Filled from the office details when supplied', max: 60 },
      { key: 'photo', label: 'Portrait', type: 'photo', default: 'head-office', shapes: ['head'], help: 'A small round portrait beside the crest, so a headshot only.' },
    ],
  },
  {
    id: 'quote-card',
    category: 'digital',
    title: 'Quote card',
    body: 'A square card for social media carrying a line from the chief in his own words, on the cloth.',
    sheet: { w: 1080, h: 1080, unit: 'px', label: '1080 × 1080 px' },
    formats: ['PNG'],
    fields: [
      {
        key: 'quote',
        label: 'Quotation',
        type: 'textarea',
        default: CHIEF.motto,
        max: 180,
        help: 'His own words. Do not paraphrase the motto.',
      },
      { key: 'attribution', label: 'Attribution', type: 'text', default: `${CHIEF.fullName}, ${CHIEF.title}`, max: 56 },
      { key: 'photo', label: 'Portrait', type: 'photo', default: 'regalia', shapes: ['portrait', 'head'], help: 'Fills the right of the card, so a standing or head frame.' },
    ],
  },
  {
    id: 'announcement',
    category: 'digital',
    title: 'Announcement card',
    body: 'A landscape card for announcing a durbar, a commissioning or an appearance across social channels.',
    sheet: { w: 1200, h: 630, unit: 'px', label: '1200 × 630 px' },
    formats: ['PNG'],
    fields: [
      { key: 'kicker', label: 'Kicker', type: 'text', default: 'From the office', max: 26 },
      { key: 'headline', label: 'Headline', type: 'text', default: 'Commissioning of the sanitation facility', max: 62 },
      { key: 'detail', label: 'Detail line', type: 'text', placeholder: 'Adrobaa · 14 March 2026 · 10:00', max: 52 },
      { key: 'photo', label: 'Photograph', type: 'photo', default: 'court', shapes: ['wide', 'portrait'], help: 'Fills the card; the type sits in a band along the bottom.' },
    ],
  },
  {
    id: 'press-header',
    category: 'digital',
    title: 'Press release header',
    body: 'The banner at the head of a statement issued to newsrooms, with the release date and contact.',
    sheet: { w: 1240, h: 400, unit: 'px', label: '1240 × 400 px' },
    formats: ['PNG', 'PDF'],
    fields: [
      { key: 'status', label: 'Release status', type: 'select', options: ['For immediate release', 'Embargoed'], default: 'For immediate release' },
      { key: 'headline', label: 'Headline', type: 'text', default: 'Nkosuo Hene opens sanitation facility at Adrobaa', max: 68 },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'photo', label: 'Portrait', type: 'photo', default: 'head-office', shapes: ['head'], help: 'Sits in a circle at the right of the banner, so a headshot only.' },
    ],
  },
];

export function assetsByCategory(category: BrandAsset['category']) {
  return BRAND_ASSETS.filter((a) => a.category === category);
}

/** Field defaults as a plain record, ready to seed the editor. */
export function defaultValues(asset: BrandAsset): Record<string, string> {
  const out: Record<string, string> = {};
  asset.fields.forEach((f) => {
    out[f.key] = f.default ?? '';
  });
  return out;
}

/** A filename the office can file without renaming it. */
export function assetFilename(asset: BrandAsset, ext: string): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `adrobaa-${asset.id}-${stamp}.${ext}`;
}
