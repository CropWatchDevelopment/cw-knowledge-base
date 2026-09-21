import { languagesWith } from '#lib/server/content-files.ts';
import { getPublishStatus } from '#lib/server/git.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params }) => ({
	publishStatus: await getPublishStatus(),
	/** While a page is open: the languages it is written in, so the language buttons know where to go. */
	openPageLanguages: params.slug ? await languagesWith(params.slug) : null
});
