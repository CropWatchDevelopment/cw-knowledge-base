import { buildTopic } from '#lib/controllers/topic.controller.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { index } = await parent();
	return buildTopic(index, params.topic);
};
