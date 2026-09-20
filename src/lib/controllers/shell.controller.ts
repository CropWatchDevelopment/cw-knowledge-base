import type { SiteIndex, TopicIcon } from '#lib/models/content.ts';
import type { ContentRepository } from '#lib/models/content-repository.ts';
import { localize, type Locale } from '#lib/models/locale.ts';
import { buildSearchEntries, type SearchEntry } from '#lib/models/search.ts';

export type NavTopic = {
	id: string;
	icon: TopicIcon;
	title: string;
	description: string;
	pages: { slug: string; title: string }[];
};

export type ShellData = {
	lang: Locale;
	/** Kept so page controllers can build on it without fetching it again. */
	index: SiteIndex;
	nav: NavTopic[];
	searchEntries: SearchEntry[];
};

/** Everything the site frame needs in one language: menu, search data, and the index itself. */
export async function loadShell(content: ContentRepository, lang: Locale): Promise<ShellData> {
	const index = await content.index();

	const nav = index.topics.map((topic) => ({
		id: topic.id,
		icon: topic.icon,
		title: localize(topic.title, lang),
		description: localize(topic.description, lang),
		pages: topic.pages
			.filter((slug) => slug in index.pages)
			.map((slug) => ({ slug, title: localize(index.pages[slug].title, lang) }))
	}));

	return { lang, index, nav, searchEntries: buildSearchEntries(index, lang) };
}
