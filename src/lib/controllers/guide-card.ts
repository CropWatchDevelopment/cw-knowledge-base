import type { SiteIndex } from '#lib/models/content.ts';
import { localize, type Locale } from '#lib/models/locale.ts';

export type GuideCard = {
	slug: string;
	topic: string;
	topicTitle: string;
	title: string;
	summary: string;
	image: string | null;
	hasVideo: boolean;
};

/** Cards for the given slugs, in order. Slugs missing from the index are skipped. */
export function toGuideCards(index: SiteIndex, lang: Locale, slugs: string[]): GuideCard[] {
	return slugs.flatMap((slug) => {
		const page = index.pages[slug];
		const topic = page && index.topics.find((candidate) => candidate.id === page.topic);
		if (!page || !topic) return [];

		return {
			slug,
			topic: topic.id,
			topicTitle: localize(topic.title, lang),
			title: localize(page.title, lang),
			summary: localize(page.summary, lang),
			image: page.image ?? null,
			hasVideo: page.hasVideo
		};
	});
}
