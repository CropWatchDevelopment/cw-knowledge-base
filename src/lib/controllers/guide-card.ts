import type { SiteIndex } from '#lib/models/content.ts';

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
export function toGuideCards(index: SiteIndex, slugs: string[]): GuideCard[] {
	return slugs.flatMap((slug) => {
		const page = index.pages[slug];
		const topic = page && index.topics.find((candidate) => candidate.id === page.topic);
		if (!page || !topic) return [];

		return {
			slug,
			topic: topic.id,
			topicTitle: topic.title,
			title: page.title,
			summary: page.summary,
			image: page.image ?? null,
			hasVideo: page.hasVideo
		};
	});
}
