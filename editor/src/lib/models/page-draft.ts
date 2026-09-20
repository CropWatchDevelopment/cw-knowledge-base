/**
 * A page while it is being edited.
 *
 * On disk, a language that is not written yet is simply absent. On screen every language needs a
 * value to type into, so a draft fills the gaps with empty text and `fromDraft` removes them again.
 */
import {
	DEFAULT_LOCALE,
	LOCALES,
	type Block,
	type LinkRecord,
	type Locale,
	type Localized,
	type PageDocument,
	type PageSummary,
	type SiteIndex
} from '#lib/site.ts';

type PerLocale<T> = Record<Locale, T>;

export type DraftImage = {
	/** Path under `static/content/`, or `null` while the picture is still to come. */
	src: string | null;
	alt: PerLocale<string>;
	caption: PerLocale<string>;
	side: 'left' | 'right';
	width?: number;
	height?: number;
};

export type DraftSection = {
	/** Identifies the section on screen. Never saved. */
	key: string;
	/** Sections that are already published keep their anchor, because other pages and emails may link to it. */
	anchorLocked: boolean;
	id: string;
	heading: PerLocale<string>;
	body: PerLocale<Block[]>;
	image: DraftImage | null;
};

export type DraftLink = { key: string } & (
	{ kind: 'page'; slug: string } | { kind: 'url'; href: string; label: PerLocale<string> }
);

export type PageDraft = {
	slug: string;
	topic: string;
	title: PerLocale<string>;
	intro: PerLocale<string>;
	summary: PerLocale<string>;
	/** Comma-separated, as typed. */
	keywords: PerLocale<string>;
	sections: DraftSection[];
	links: DraftLink[];
	videoUrl: string;
	/** Kept as loaded; the editor has no field for it. */
	videoTitle: Localized<string> | undefined;
	featured: boolean;
	popular: boolean;
};

/** What the server needs to write a page and its entry in `index.json`. */
export type PageSave = {
	page: PageDocument;
	meta: {
		summary: Localized<string>;
		keywords: Localized<string[]>;
		featured: boolean;
		popular: boolean;
	};
};

function fill<T>(value: Partial<Record<Locale, T>> | undefined, empty: () => T): PerLocale<T> {
	return Object.fromEntries(
		LOCALES.map((locale) => [locale, value?.[locale] ?? empty()])
	) as PerLocale<T>;
}

/** Keeps the default language always, and any other language that has something in it. */
function prune<T>(value: PerLocale<T>, isEmpty: (candidate: T) => boolean): Localized<T> {
	return Object.fromEntries(
		LOCALES.filter((locale) => locale === DEFAULT_LOCALE || !isEmpty(value[locale])).map(
			(locale) => [locale, value[locale]]
		)
	) as Localized<T>;
}

const blank = (text: string) => text.trim() === '';
const trimAll = (value: PerLocale<string>) =>
	Object.fromEntries(LOCALES.map((locale) => [locale, value[locale].trim()])) as PerLocale<string>;

export function newSection(): DraftSection {
	return {
		key: crypto.randomUUID(),
		anchorLocked: false,
		id: '',
		heading: fill(undefined, () => ''),
		body: fill<Block[]>(undefined, () => []),
		image: null
	};
}

export function newImage(): DraftImage {
	return {
		src: null,
		alt: fill(undefined, () => ''),
		caption: fill(undefined, () => ''),
		side: 'right'
	};
}

export function newLink(kind: DraftLink['kind']): DraftLink {
	const key = crypto.randomUUID();
	return kind === 'page'
		? { key, kind, slug: '' }
		: { key, kind, href: '', label: fill(undefined, () => '') };
}

export function newDraft(topic: string): PageDraft {
	return {
		slug: '',
		topic,
		title: fill(undefined, () => ''),
		intro: fill(undefined, () => ''),
		summary: fill(undefined, () => ''),
		keywords: fill(undefined, () => ''),
		sections: [newSection()],
		links: [],
		videoUrl: '',
		videoTitle: undefined,
		featured: false,
		popular: false
	};
}

export function toDraft(page: PageDocument, index: SiteIndex): PageDraft {
	const summary: PageSummary | undefined = index.pages[page.slug];

	return {
		slug: page.slug,
		topic: page.topic,
		title: fill(page.title, () => ''),
		intro: fill(page.intro, () => ''),
		summary: fill(summary?.summary, () => ''),
		keywords: fill(
			Object.fromEntries(
				LOCALES.map((locale) => [locale, summary?.keywords?.[locale]?.join(', ')])
			),
			() => ''
		),
		sections: page.sections.map((section) => ({
			key: crypto.randomUUID(),
			anchorLocked: true,
			id: section.id,
			heading: fill(section.heading, () => ''),
			body: fill<Block[]>(section.body, () => []),
			image: section.image
				? {
						src: section.image.src,
						alt: fill(section.image.alt, () => ''),
						caption: fill(section.image.caption, () => ''),
						side: section.image.side,
						width: section.image.width,
						height: section.image.height
					}
				: null
		})),
		links: (page.links ?? []).map((link) =>
			link.kind === 'page'
				? { key: crypto.randomUUID(), ...link }
				: { key: crypto.randomUUID(), ...link, label: fill(link.label, () => '') }
		),
		videoUrl: page.video?.url ?? '',
		videoTitle: page.video?.title,
		featured: index.featured.includes(page.slug),
		popular: index.popular.includes(page.slug)
	};
}

export function fromDraft(draft: PageDraft): PageSave {
	const links = draft.links.flatMap((link): LinkRecord[] => {
		if (link.kind === 'page') return link.slug ? [{ kind: 'page', slug: link.slug }] : [];
		if (blank(link.href)) return [];
		return [{ kind: 'url', href: link.href.trim(), label: prune(trimAll(link.label), blank) }];
	});

	const page: PageDocument = {
		slug: draft.slug,
		topic: draft.topic,
		title: prune(trimAll(draft.title), blank),
		intro: prune(trimAll(draft.intro), blank),
		sections: draft.sections.map((section) => {
			const image = section.image;
			const caption = image && prune(trimAll(image.caption), blank);

			return {
				id: section.id,
				heading: prune(trimAll(section.heading), blank),
				body: prune(section.body, (blocks) => blocks.length === 0),
				...(image && {
					image: {
						src: image.src,
						alt: prune(trimAll(image.alt), blank),
						...(caption && !blank(caption[DEFAULT_LOCALE]) && { caption }),
						side: image.side,
						...(image.width && image.height && { width: image.width, height: image.height })
					}
				})
			};
		}),
		...(links.length > 0 && { links }),
		...(!blank(draft.videoUrl) && {
			video: { url: draft.videoUrl.trim(), ...(draft.videoTitle && { title: draft.videoTitle }) }
		})
	};

	const keywords = Object.fromEntries(
		LOCALES.map((locale) => [
			locale,
			draft.keywords[locale]
				.split(/[,、]/)
				.map((word) => word.trim())
				.filter(Boolean)
		])
	) as PerLocale<string[]>;

	return {
		page,
		meta: {
			summary: prune(trimAll(draft.summary), blank),
			keywords: prune(keywords, (words) => words.length === 0),
			featured: draft.featured,
			popular: draft.popular
		}
	};
}
