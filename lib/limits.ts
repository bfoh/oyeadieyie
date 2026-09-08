/**
 * How much of each list the home page actually shows.
 *
 * These caps exist because the home page is a single scroll and a wall of
 * twenty photographs would swamp everything beneath it. They are not a
 * problem in themselves — but they were silent. The office could upload a
 * tenth photograph, see it listed in the admin, and never learn that it had
 * pushed the first one off the public page. There is no archive to catch what
 * falls off, so the admin says so instead.
 *
 * Kept here rather than inline so the number the admin quotes and the number
 * the page slices to cannot drift apart.
 */
export const HOME_LIMITS = {
  /* Newest first. */
  updates: 3,
  /* Soonest first, and only those still ahead. */
  events: 4,
  gallery: 9,
} as const;
