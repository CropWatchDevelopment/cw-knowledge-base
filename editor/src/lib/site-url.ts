/** The website's own dev server: same machine as the editor, a different port. */
const SITE_PORT = 5173;

/** `hostname` comes from the address the editor is open at, so it also works over the network. */
export const siteUrl = (hostname: string, path = '') => `http://${hostname}:${SITE_PORT}${path}`;
