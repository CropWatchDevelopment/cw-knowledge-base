import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { DEFAULT_LOCALE } from '#lib/site.ts';
import type { PageServerLoad } from './$types';

/** The editor works in one language at a time; `/` opens the one the site was written in first. */
export const load: PageServerLoad = () => {
	redirect(307, resolve('/[lang=lang]', { lang: DEFAULT_LOCALE }));
};
