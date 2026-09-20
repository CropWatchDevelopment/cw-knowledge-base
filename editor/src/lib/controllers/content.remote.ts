/** Everything the editor can change on disk. These run on this computer only; the browser calls them like functions. */
import { error } from '@sveltejs/kit';
import { command } from '$app/server';
import * as v from 'valibot';
import {
	applyPageToIndex,
	movePageInIndex,
	removePageFromIndex
} from '#lib/models/index-update.ts';
import { SLUG_PATTERN } from '#lib/models/slug.ts';
import { findProblems, pageSaveSchema, topicsSchema } from '#lib/models/validation.ts';
import {
	deletePageFiles,
	readIndex,
	removeUnusedImages,
	writeIndex,
	writePage
} from '#lib/server/content-files.ts';
import { publish } from '#lib/server/git.ts';

const slug = v.pipe(v.string(), v.regex(SLUG_PATTERN));

export const savePage = command(pageSaveSchema, async ({ isNew, page, meta }) => {
	const index = await readIndex();

	const problems = findProblems(page, index, isNew);
	if (problems.length > 0) error(422, problems.join('\n'));

	await writePage(page);
	await removeUnusedImages(page);
	await writeIndex(applyPageToIndex(index, { page, meta }));
});

export const deletePage = command(slug, async (pageSlug) => {
	await writeIndex(removePageFromIndex(await readIndex(), pageSlug));
	await deletePageFiles(pageSlug);
});

export const movePage = command(
	v.object({ slug, direction: v.picklist(['up', 'down']) }),
	async ({ slug: pageSlug, direction }) => {
		await writeIndex(movePageInIndex(await readIndex(), pageSlug, direction));
	}
);

/** Topics arrive in menu order. A topic can only be left out once it has no pages. */
export const saveTopics = command(topicsSchema, async (topics) => {
	const index = await readIndex();

	const orphaned = index.topics.find(
		(existing) => existing.pages.length > 0 && !topics.some((topic) => topic.id === existing.id)
	);
	if (orphaned)
		error(422, `Move or delete the pages in “${orphaned.title.en}” before removing it.`);

	await writeIndex({
		...index,
		topics: topics.map((topic) => ({
			...topic,
			pages: index.topics.find((existing) => existing.id === topic.id)?.pages ?? []
		}))
	});
});

export const publishContent = command(v.pipe(v.string(), v.trim(), v.minLength(1)), (message) =>
	publish(message)
);
