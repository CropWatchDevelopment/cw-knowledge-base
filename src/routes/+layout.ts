// The whole knowledge base is static content, so every page is built ahead of time.
// (`/` is the one exception: it picks a language per visitor. See `+page.server.ts`.)
export const prerender = true;
