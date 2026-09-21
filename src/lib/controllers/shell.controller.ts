import type { SiteIndex, TopicIcon } from '#lib/models/content.ts';
import type { ContentRepository } from '#lib/models/content-repository.ts';
import { LOCALES, type Locale } from '#lib/models/locale.ts';
import { buildSearchEntries, type SearchEntry } from '#lib/models/search.ts';

export type NavTopic = {
	id: string;
	icon: TopicIcon;
	title: string;
	description: string;
	pages: { slug: string; title: string }[];
};

/** What one language holds, so the language menu can tell where a reader would land. */
export type Availability = {
	/** Topic ids with at least one guide in this language. */
	topics: string[];
	/** Guide slug to the topic it sits under in this language. */
	pages: Record<string, string>;
};

export type ShellData = {
	lang: Locale;
	/** Kept so page controllers can build on it without fetching it again. */
	index: SiteIndex;
	nav: NavTopic[];
	searchEntries: SearchEntry[];
	available: Record<Locale, Availability>;
};

function availability(index: SiteIndex): Availability {
	const topics = index.topics.filter((topic) => topic.pages.length > 0);
	return {
		topics: topics.map((topic) => topic.id),
		pages: Object.fromEntries(
			topics.flatMap((topic) => topic.pages.map((slug) => [slug, topic.id]))
		)
	};
}

/**
 * Everything the site frame needs in one language: menu, search data, and the index itself.
 *
 * A topic with nothing written in this language is dropped here rather than in each view, so
 * an untranslated corner of the site is absent from the menu, the home page and its own address
 * alike, and reappears by itself the moment a guide is written for it.
 */
export async function loadShell(content: ContentRepository, lang: Locale): Promise<ShellData> {
	const indexes = await Promise.all(LOCALES.map((locale) => content.index(locale)));
	const byLocale = Object.fromEntries(LOCALES.map((locale, i) => [locale, indexes[i]])) as Record<
		Locale,
		SiteIndex
	>;

	const loaded = byLocale[lang];
	const index: SiteIndex = { ...loaded, topics: loaded.topics.filter((t) => t.pages.length > 0) };

	const nav = index.topics.map((topic) => ({
		id: topic.id,
		icon: topic.icon,
		title: topic.title,
		description: topic.description,
		pages: topic.pages
			.filter((slug) => slug in index.pages)
			.map((slug) => ({ slug, title: index.pages[slug].title }))
	}));

	return {
		lang,
		index,
		nav,
		searchEntries: buildSearchEntries(index),
		available: Object.fromEntries(
			LOCALES.map((locale) => [locale, availability(byLocale[locale])])
		) as Record<Locale, Availability>
	};
}
