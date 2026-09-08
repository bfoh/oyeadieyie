/**
 * The cookie name, on its own.
 *
 * The middleware runs in the edge runtime, which cannot load node:crypto, so
 * it must not import the module that verifies tokens. Keeping the name here
 * lets both sides share it without dragging the crypto in.
 */
export const ADMIN_COOKIE = 'adrobaa_admin';
