/** Everything the editor can change on disk. These run on this computer only; the browser calls them like functions. */
import { error } from '@sveltejs/kit';
import { command } from '$app/server';
import * as v from 'valibot';
import {
	applyPageToIndex,
	movePageInIndex,
	removePageFromIndex
} from '#lib/models/index-update.ts';
import { emptyCopyOf } from '#lib/models/page-draft.ts';
import { SLUG_PATTERN } from '#lib/models/slug.ts';
import { findProblems, pageSaveSchema, topicsSchema } from '#lib/models/validation.ts';
import {
	deletePageFiles,
	readIndex,
	readPage,
	removeUnusedImages,
	writeIndex,
	writePage
} from '#lib/server/content-files.ts';
import { publish } from '#lib/server/git.ts';
import { LOCALES } from '#lib/site.ts';

const slug = v.pipe(v.string(), v.regex(SLUG_PATTERN));
const lang = v.picklist(LOCALES);

export const savePage = command(
	v.object({ lang, ...pageSaveSchema.entries }),
	async ({ lang: locale, isNew, page, meta }) => {
		const index = await readIndex(locale);

		const problems = findProblems(page, index, isNew);
		if (problems.length > 0) error(422, problems.join('\n'));

		await writePage(locale, page);
		await removeUnusedImages(page.slug);
		await writeIndex(locale, applyPageToIndex(index, { page, meta }));
	}
);

export const deletePage = command(
	v.object({ lang, slug }),
	async ({ lang: locale, slug: pageSlug }) => {
		await writeIndex(locale, removePageFromIndex(await readIndex(locale), pageSlug));
		await deletePageFiles(locale, pageSlug);
	}
);

export const movePage = command(
	v.object({ lang, slug, direction: v.picklist(['up', 'down']) }),
	async ({ lang: locale, slug: pageSlug, direction }) => {
		await writeIndex(locale, movePageInIndex(await readIndex(locale), pageSlug, direction));
	}
);

/**
 * Starts this language's copy of a guide that exists in another one: the same sections, anchors
 * and pictures, with every piece of text left empty to be written.
 */
export const startTranslation = command(
	v.object({ lang, from: lang, slug }),
	async ({ lang: locale, from, slug: pageSlug }) => {
		if (await readPage(locale, pageSlug)) error(409, 'That page already exists in this language.');

		const source = await readPage(from, pageSlug);
		if (!source) error(404, 'That page is not written in the language you are copying from.');

		const index = await readIndex(locale);
		if (!index.topics.some((topic) => topic.id === source.topic)) {
			error(422, `Add the topic “${source.topic}” in this language first.`);
		}

		const page = emptyCopyOf(source);
		// A related link to a guide this language has not got would lead nowhere.
		page.links = page.links?.filter((link) => link.kind === 'page' && link.slug in index.pages);
		if (page.links?.length === 0) delete page.links;

		await writePage(locale, page);
		await writeIndex(
			locale,
			applyPageToIndex(index, {
				page,
				meta: { summary: '', keywords: [], featured: false, popular: false }
			})
		);
	}
);

/** Topics arrive in menu order. A topic can only be left out once it has no pages. */
export const saveTopics = command(
	v.object({ lang, topics: topicsSchema }),
	async ({ lang: locale, topics }) => {
		const index = await readIndex(locale);

		const orphaned = index.topics.find(
			(existing) => existing.pages.length > 0 && !topics.some((topic) => topic.id === existing.id)
		);
		if (orphaned) error(422, `Move or delete the pages in “${orphaned.title}” before removing it.`);

		await writeIndex(locale, {
			...index,
			topics: topics.map((topic) => ({
				...topic,
				pages: index.topics.find((existing) => existing.id === topic.id)?.pages ?? []
			}))
		});
	}
);

export const publishContent = command(v.pipe(v.string(), v.trim(), v.minLength(1)), (message) =>
	publish(message)
);
