/**
 * The canonical origin.
 *
 * One definition, used by the metadata, the sitemap, robots and the
 * structured data, so they can never disagree about where this site lives.
 * Override with NEXT_PUBLIC_SITE_URL if the domain changes.
 */
export const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'https://nanaoyeadieyie.com';
