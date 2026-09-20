import type { SiteIndex } from './content.ts';
import { DEFAULT_LOCALE, localize, type Locale } from './locale.ts';

export type SearchEntry = {
	slug: string;
	topic: string;
	topicTitle: string;
	title: string;
	summary: string;
	hasVideo: boolean;
	/** Normalized text the query is matched against. */
	haystack: { title: string; keywords: string; summary: string };
};

/** Lower-cases and folds full-width / half-width forms so Japanese and English match alike. */
function normalize(text: string): string {
	return text.normalize('NFKC').toLowerCase().trim();
}

/** One entry per page listed in a topic, in menu order, with text in `locale`. */
export function buildSearchEntries(index: SiteIndex, locale: Locale): SearchEntry[] {
	return index.topics.flatMap((topic) =>
		topic.pages.flatMap((slug) => {
			const page = index.pages[slug];
			if (!page) return [];

			const title = localize(page.title, locale);
			const summary = localize(page.summary, locale);
			const topicTitle = localize(topic.title, locale);
			const keywords = page.keywords ? localize(page.keywords, locale) : [];

			// Product words are often typed in English whatever the reader's language,
			// so the default-language title and keywords are searchable everywhere.
			const fallbackTitle = page.title[DEFAULT_LOCALE];
			const fallbackKeywords = page.keywords?.[DEFAULT_LOCALE] ?? [];

			return {
				slug,
				topic: topic.id,
				topicTitle,
				title,
				summary,
				hasVideo: page.hasVideo,
				haystack: {
					title: normalize(title),
					keywords: normalize(
						[...keywords, topicTitle, fallbackTitle, ...fallbackKeywords].join(' ')
					),
					summary: normalize(summary)
				}
			};
		})
	);
}

/** Entries matching every word of `query`, best match first. Title beats keywords beats summary. */
export function searchEntries(entries: SearchEntry[], query: string): SearchEntry[] {
	const words = normalize(query).split(/\s+/).filter(Boolean);
	if (words.length === 0) return [];

	return entries
		.map((entry) => {
			let score = 0;
			for (const word of words) {
				if (entry.haystack.title.startsWith(word)) score += 8;
				else if (entry.haystack.title.includes(word)) score += 5;
				else if (entry.haystack.keywords.includes(word)) score += 3;
				else if (entry.haystack.summary.includes(word)) score += 1;
				else return { entry, score: 0 };
			}
			return { entry, score };
		})
		.filter((result) => result.score > 0)
		.sort((a, b) => b.score - a.score)
		.map((result) => result.entry);
}
