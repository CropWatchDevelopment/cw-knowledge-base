import type { SiteIndex } from '#lib/models/content.ts';
import { toGuideCards, type GuideCard } from './guide-card.ts';

export type HomeData = {
	featured: GuideCard[];
	popular: GuideCard[];
};

export function buildHome(index: SiteIndex): HomeData {
	return {
		featured: toGuideCards(index, index.featured),
		popular: toGuideCards(index, index.popular)
	};
}
