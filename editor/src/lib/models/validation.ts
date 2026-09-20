/**
 * Two layers of checking before anything is written to disk:
 *
 * - `findProblems` explains, in plain words, what a writer still has to fix. It runs in the browser
 *   before saving and again on the server.
 * - `pageSaveSchema` makes sure whatever reaches the server has the exact shape of the content format.
 */
import * as v from 'valibot';
import {
	DEFAULT_LOCALE,
	LOCALES,
	youtubeId,
	type Localized,
	type PageDocument,
	type SiteIndex
} from '#lib/site.ts';
import type { PageSave } from './page-draft.ts';
import { RESERVED_ANCHORS, SLUG_PATTERN } from './slug.ts';

export function findProblems(page: PageDocument, index: SiteIndex, isNew: boolean): string[] {
	const problems: string[] = [];

	if (!page.title[DEFAULT_LOCALE]) problems.push('Give the page a title in English.');

	if (!SLUG_PATTERN.test(page.slug)) {
		problems.push('The page address can only use lowercase letters, numbers and hyphens.');
	} else if (isNew && page.slug in index.pages) {
		problems.push(`Another page already uses the address “${page.slug}”. Choose a different one.`);
	}

	if (!index.topics.some((topic) => topic.id === page.topic)) problems.push('Choose a topic.');

	const seen = new Set<string>();
	page.sections.forEach((section, i) => {
		const name = `Section ${i + 1}`;

		if (!section.heading[DEFAULT_LOCALE]) problems.push(`${name} needs a heading in English.`);

		if (!SLUG_PATTERN.test(section.id)) {
			problems.push(`${name} needs a link name made of lowercase letters, numbers and hyphens.`);
		} else if (RESERVED_ANCHORS.includes(section.id)) {
			problems.push(
				`${name}: the link name “${section.id}” is used by the site itself. Pick another.`
			);
		} else if (seen.has(section.id)) {
			problems.push(`${name}: another section already uses the link name “${section.id}”.`);
		}
		seen.add(section.id);

		if (section.image && !section.image.alt[DEFAULT_LOCALE]) {
			problems.push(`${name}: describe the picture in English, for people who cannot see it.`);
		}
	});

	if (page.video && !youtubeId(page.video.url)) {
		problems.push('The demo video link is not a YouTube link.');
	}

	return problems;
}

/** Text in every language, English required. */
function localized<T extends v.GenericSchema>(item: T) {
	return v.pipe(
		v.record(v.picklist(LOCALES), item),
		v.check((value) => DEFAULT_LOCALE in value, 'English text is required')
	) as unknown as v.GenericSchema<Localized<v.InferOutput<T>>>;
}

const slug = v.pipe(v.string(), v.regex(SLUG_PATTERN));

const inline = v.object({
	text: v.string(),
	bold: v.optional(v.boolean()),
	italic: v.optional(v.boolean()),
	href: v.optional(v.pipe(v.string(), v.regex(/^(https?:\/\/|mailto:|tel:|page:)/)))
});

const block = v.variant('type', [
	v.object({ type: v.literal('paragraph'), content: v.array(inline) }),
	v.object({ type: v.literal('list'), ordered: v.boolean(), items: v.array(v.array(inline)) }),
	v.object({ type: v.literal('note'), content: v.array(inline) })
]);

/** A picture lives in the page's own folder: `images/<page>/<file>`. */
const imagePath = v.pipe(v.string(), v.regex(/^images\/[a-z0-9-]+\/[a-z0-9][a-z0-9._-]*$/));

export const pageSaveSchema = v.object({
	isNew: v.boolean(),
	page: v.object({
		slug,
		topic: slug,
		title: localized(v.string()),
		intro: localized(v.string()),
		sections: v.array(
			v.object({
				id: slug,
				heading: localized(v.string()),
				body: localized(v.array(block)),
				image: v.optional(
					v.object({
						src: v.nullable(imagePath),
						alt: localized(v.string()),
						caption: v.optional(localized(v.string())),
						side: v.picklist(['left', 'right']),
						width: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
						height: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1)))
					})
				)
			})
		),
		links: v.optional(
			v.array(
				v.variant('kind', [
					v.object({ kind: v.literal('page'), slug }),
					v.object({
						kind: v.literal('url'),
						href: v.pipe(v.string(), v.url()),
						label: localized(v.string())
					})
				])
			)
		),
		video: v.optional(v.object({ url: v.string(), title: v.optional(localized(v.string())) }))
	}),
	meta: v.object({
		summary: localized(v.string()),
		keywords: localized(v.array(v.string())),
		featured: v.boolean(),
		popular: v.boolean()
	})
}) satisfies v.GenericSchema<unknown, PageSave & { isNew: boolean }>;

/** The topics in menu order. Page lists are not part of it: the server keeps those as they are. */
export const topicsSchema = v.pipe(
	v.array(
		v.object({
			id: slug,
			icon: v.picklist(['hardware', 'software', 'gateway', 'concepts']),
			title: localized(v.pipe(v.string(), v.trim(), v.minLength(1))),
			description: localized(v.string())
		})
	),
	v.minLength(1),
	v.check(
		(topics) => new Set(topics.map((topic) => topic.id)).size === topics.length,
		'Two topics share the same address'
	)
);
