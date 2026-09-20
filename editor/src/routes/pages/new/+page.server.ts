import { loadLinkTargets } from '#lib/controllers/pages.controller.ts';
import { newDraft } from '#lib/models/page-draft.ts';
import { readIndex } from '#lib/server/content-files.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const [index, linkTargets] = await Promise.all([readIndex(), loadLinkTargets()]);

	// "New page" inside a topic arrives as /pages/new?topic=gateways
	const wanted = url.searchParams.get('topic');
	const topic = index.topics.find((candidate) => candidate.id === wanted) ?? index.topics[0];

	return { index, draft: newDraft(topic.id), linkTargets };
};
