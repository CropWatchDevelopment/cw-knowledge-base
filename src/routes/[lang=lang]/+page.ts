import { buildHome } from '#lib/controllers/home.controller.ts';
import { LOCALES } from '#lib/models/locale.ts';
import type { EntryGenerator, PageLoad } from './$types';

/** Where prerendering starts: every other page is found by following links from these. */
export const entries: EntryGenerator = () => LOCALES.map((lang) => ({ lang }));

export const load: PageLoad = async ({ parent }) => {
	const { index, lang } = await parent();
	return buildHome(index, lang);
};
