import { error } from '@sveltejs/kit';
import type { SiteIndex, TopicIcon } from '#lib/models/content.ts';
import { localize, type Locale } from '#lib/models/locale.ts';
import { toGuideCards, type GuideCard } from './guide-card.ts';

export type TopicData = {
	topic: { id: string; icon: TopicIcon; title: string; description: string };
	guides: GuideCard[];
};

export function buildTopic(index: SiteIndex, lang: Locale, topicId: string): TopicData {
	const topic = index.topics.find((candidate) => candidate.id === topicId);
	if (!topic) error(404, 'Not found');

	return {
		topic: {
			id: topic.id,
			icon: topic.icon,
			title: localize(topic.title, lang),
			description: localize(topic.description, lang)
		},
		guides: toGuideCards(index, lang, topic.pages)
	};
}
