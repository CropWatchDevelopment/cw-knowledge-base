import { languagesWith, readIndex, readPage } from '#lib/server/content-files.ts';
import { getPublishStatus } from '#lib/server/git.ts';
import { LOCALES, type Locale } from '#lib/site.ts';

export type PageRow = {
	slug: string;
	title: string;
	hasVideo: boolean;
	/** The other languages this guide is also written in. */
	alsoIn: Locale[];
	/** Differs from what is on the website. Always false until publishing is set up. */
	changed: boolean;
};

export type TopicGroup = { id: string; title: string; pages: PageRow[] };

/** A guide that exists in another language but has not been started in this one. */
export type UntranslatedRow = { slug: string; title: string; topicTitle: string; from: Locale };

export type PageList = { groups: TopicGroup[]; untranslated: UntranslatedRow[] };

export async function loadPageList(lang: Locale): Promise<PageList> {
	const [index, { changed }] = await Promise.all([readIndex(lang), getPublishStatus()]);

	const groups = await Promise.all(
		index.topics.map(async (topic) => ({
			id: topic.id,
			title: topic.title,
			pages: (
				await Promise.all(
					topic.pages.map(async (slug) => {
						const page = await readPage(lang, slug);
						if (!page) return null;
						const languages = await languagesWith(slug);

						return {
							slug,
							title: page.title || slug,
							hasVideo: Boolean(page.video),
							alsoIn: languages.filter((locale) => locale !== lang),
							changed: changed.includes(`${lang}/pages/${slug}.json`)
						};
					})
				)
			).filter((row) => row !== null)
		}))
	);

	const others = LOCALES.filter((locale) => locale !== lang);
	const untranslated: UntranslatedRow[] = [];
	for (const other of others) {
		const theirIndex = await readIndex(other);
		for (const topic of theirIndex.topics) {
			for (const slug of topic.pages) {
				if (slug in index.pages || untranslated.some((row) => row.slug === slug)) continue;
				untranslated.push({
					slug,
					title: theirIndex.pages[slug]?.title ?? slug,
					topicTitle: topic.title,
					from: other
				});
			}
		}
	}

	return { groups, untranslated };
}

/** Pages and sections a writer can link to from inside a text. Only this language's. */
export type LinkTarget = {
	slug: string;
	title: string;
	topicTitle: string;
	sections: { id: string; heading: string }[];
};

export async function loadLinkTargets(lang: Locale): Promise<LinkTarget[]> {
	const index = await readIndex(lang);

	return (
		await Promise.all(
			index.topics.flatMap((topic) =>
				topic.pages.map(async (slug) => {
					const page = await readPage(lang, slug);
					return (
						page && {
							slug,
							title: page.title || slug,
							topicTitle: topic.title,
							sections: page.sections.map((section) => ({
								id: section.id,
								heading: section.heading
							}))
						}
					);
				})
			)
		)
	).filter((target) => target !== null);
}
