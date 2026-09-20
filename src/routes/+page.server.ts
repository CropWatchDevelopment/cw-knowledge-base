import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { preferredLocale } from '#lib/models/locale.ts';
import type { PageServerLoad } from './$types';

export const prerender = false;

/** `/` has no content of its own: it sends each visitor to the home page in their browser's language. */
export const load: PageServerLoad = ({ request, setHeaders }) => {
	setHeaders({ vary: 'Accept-Language' });
	redirect(
		307,
		resolve('/[lang=lang]', { lang: preferredLocale(request.headers.get('accept-language')) })
	);
};
