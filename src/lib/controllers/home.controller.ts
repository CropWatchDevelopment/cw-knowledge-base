import type { SiteIndex } from '#lib/models/content.ts';
import type { Locale } from '#lib/models/locale.ts';
import { toGuideCards, type GuideCard } from './guide-card.ts';

export type HomeData = {
	featured: GuideCard[];
	popular: GuideCard[];
};

export function buildHome(index: SiteIndex, lang: Locale): HomeData {
	return {
		featured: toGuideCards(index, lang, index.featured),
		popular: toGuideCards(index, lang, index.popular)
	};
}
