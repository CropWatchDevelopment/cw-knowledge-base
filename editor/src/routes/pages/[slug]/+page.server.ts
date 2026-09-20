import { error } from '@sveltejs/kit';
import { loadLinkTargets } from '#lib/controllers/pages.controller.ts';
import { toDraft } from '#lib/models/page-draft.ts';
import { readIndex, readPage } from '#lib/server/content-files.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [index, page, linkTargets] = await Promise.all([
		readIndex(),
		readPage(params.slug),
		loadLinkTargets()
	]);
	if (!page) error(404, `There is no page called “${params.slug}”.`);

	return { index, draft: toDraft(page, index), linkTargets };
};
