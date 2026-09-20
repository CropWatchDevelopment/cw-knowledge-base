import { buildTopic } from '#lib/controllers/topic.controller.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { index, lang } = await parent();
	return buildTopic(index, lang, params.topic);
};
