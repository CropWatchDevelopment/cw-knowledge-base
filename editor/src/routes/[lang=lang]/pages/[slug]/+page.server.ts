import { error } from '@sveltejs/kit';
import { loadLinkTargets } from '#lib/controllers/pages.controller.ts';
import { toDraft } from '#lib/models/page-draft.ts';
import { readIndex, readPage } from '#lib/server/content-files.ts';
import { LOCALE_INFO } from '#lib/site.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [index, page, linkTargets] = await Promise.all([
		readIndex(params.lang),
		readPage(params.lang, params.slug),
		loadLinkTargets(params.lang)
	]);
	if (!page) {
		error(404, `There is no page called “${params.slug}” in ${LOCALE_INFO[params.lang].label}.`);
	}

	return { index, draft: toDraft(page, index), linkTargets };
};
