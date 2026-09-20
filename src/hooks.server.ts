import type { Handle } from '@sveltejs/kit/hooks';
import { localeFromPath } from '#lib/models/locale.ts';

/** Fills `<html lang="%lang%">` in `app.html` from the URL, so prerendered pages declare their language. */
export const handle: Handle = ({ event, resolve }) =>
	resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', localeFromPath(event.url.pathname))
	});
