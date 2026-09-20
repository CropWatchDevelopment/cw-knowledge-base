import { translationStatus, type TranslationStatus } from '#lib/models/translation.ts';
import { readIndex, readPage } from '#lib/server/content-files.ts';
import { getPublishStatus } from '#lib/server/git.ts';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '#lib/site.ts';

export type PageRow = {
	slug: string;
	title: string;
	hasVideo: boolean;
	translations: Record<Locale, TranslationStatus>;
	/** Differs from what is on the website. Always false until publishing is set up. */
	changed: boolean;
};

export type TopicGroup = { id: string; title: string; pages: PageRow[] };

export async function loadPageList(): Promise<TopicGroup[]> {
	const [index, { changed }] = await Promise.all([readIndex(), getPublishStatus()]);

	return Promise.all(
		index.topics.map(async (topic) => ({
			id: topic.id,
			title: topic.title[DEFAULT_LOCALE],
			pages: (await Promise.all(topic.pages.map(readPage))).flatMap((page): PageRow[] =>
				page
					? [
							{
								slug: page.slug,
								title: page.title[DEFAULT_LOCALE],
								hasVideo: Boolean(page.video),
								translations: Object.fromEntries(
									LOCALES.map((locale) => [locale, translationStatus(page, locale)])
								) as Record<Locale, TranslationStatus>,
								changed: changed.includes(`pages/${page.slug}.json`)
							}
						]
					: []
			)
		}))
	);
}

/** Pages and sections a writer can link to from inside a text. */
export type LinkTarget = {
	slug: string;
	title: string;
	topicTitle: string;
	sections: { id: string; heading: string }[];
};

export async function loadLinkTargets(): Promise<LinkTarget[]> {
	const index = await readIndex();

	return (
		await Promise.all(
			index.topics.flatMap((topic) =>
				topic.pages.map(async (slug) => {
					const page = await readPage(slug);
					return (
						page && {
							slug,
							title: page.title[DEFAULT_LOCALE],
							topicTitle: topic.title[DEFAULT_LOCALE],
							sections: page.sections.map((section) => ({
								id: section.id,
								heading: section.heading[DEFAULT_LOCALE]
							}))
						}
					);
				})
			)
		)
	).filter((target) => target !== null);
}
