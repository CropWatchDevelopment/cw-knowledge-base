import { error } from '@sveltejs/kit';
import type { SiteIndex, TopicIcon } from '#lib/models/content.ts';
import { toGuideCards, type GuideCard } from './guide-card.ts';

export type TopicData = {
	topic: { id: string; icon: TopicIcon; title: string; description: string };
	guides: GuideCard[];
};

export function buildTopic(index: SiteIndex, topicId: string): TopicData {
	const topic = index.topics.find((candidate) => candidate.id === topicId);
	if (!topic) error(404, 'Not found');

	return {
		topic: {
			id: topic.id,
			icon: topic.icon,
			title: topic.title,
			description: topic.description
		},
		guides: toGuideCards(index, topic.pages)
	};
}
