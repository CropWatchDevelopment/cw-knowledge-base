import { loadArticle } from '#lib/controllers/article.controller.ts';
import { contentUrl } from '#lib/controllers/content-url.ts';
import { ContentRepository } from '#lib/models/content-repository.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
	const { index, lang } = await parent();
	return {
		article: await loadArticle(
			new ContentRepository(fetch, contentUrl),
			index,
			lang,
			params.topic,
			params.slug
		)
	};
};
