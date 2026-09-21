/**
 * A page while it is being edited.
 *
 * A draft holds one language, the one being written. The other language's copy of the same guide
 * is a separate file that this editor does not touch, so nothing typed here can leak into it.
 */
import type { Block, LinkRecord, PageDocument, PageSummary, SiteIndex } from '#lib/site.ts';

export type DraftImage = {
	/** Path under `static/content/`, or `null` while the picture is still to come. */
	src: string | null;
	alt: string;
	caption: string;
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
	heading: string;
	body: Block[];
	image: DraftImage | null;
};

export type DraftLink = { key: string } & (
	{ kind: 'page'; slug: string } | { kind: 'url'; href: string; label: string }
);

export type PageDraft = {
	slug: string;
	topic: string;
	title: string;
	intro: string;
	summary: string;
	/** Comma-separated, as typed. */
	keywords: string;
	sections: DraftSection[];
	links: DraftLink[];
	videoUrl: string;
	/** Kept as loaded; the editor has no field for it. */
	videoTitle: string | undefined;
	featured: boolean;
	popular: boolean;
};

/** What the server needs to write a page and its entry in that language's `index.json`. */
export type PageSave = {
	page: PageDocument;
	meta: {
		summary: string;
		keywords: string[];
		featured: boolean;
		popular: boolean;
	};
};

const blank = (text: string) => text.trim() === '';

export function newSection(): DraftSection {
	return {
		key: crypto.randomUUID(),
		anchorLocked: false,
		id: '',
		heading: '',
		body: [],
		image: null
	};
}

export function newImage(): DraftImage {
	return { src: null, alt: '', caption: '', side: 'right' };
}

export function newLink(kind: DraftLink['kind']): DraftLink {
	const key = crypto.randomUUID();
	return kind === 'page' ? { key, kind, slug: '' } : { key, kind, href: '', label: '' };
}

export function newDraft(topic: string): PageDraft {
	return {
		slug: '',
		topic,
		title: '',
		intro: '',
		summary: '',
		keywords: '',
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
		title: page.title,
		intro: page.intro,
		summary: summary?.summary ?? '',
		keywords: summary?.keywords?.join(', ') ?? '',
		sections: page.sections.map((section) => ({
			key: crypto.randomUUID(),
			anchorLocked: true,
			id: section.id,
			heading: section.heading,
			body: section.body,
			image: section.image
				? {
						src: section.image.src,
						alt: section.image.alt,
						caption: section.image.caption ?? '',
						side: section.image.side,
						width: section.image.width,
						height: section.image.height
					}
				: null
		})),
		links: (page.links ?? []).map((link) => ({ key: crypto.randomUUID(), ...link })),
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
		return [{ kind: 'url', href: link.href.trim(), label: link.label.trim() }];
	});

	const page: PageDocument = {
		slug: draft.slug,
		topic: draft.topic,
		title: draft.title.trim(),
		intro: draft.intro.trim(),
		sections: draft.sections.map((section) => {
			const image = section.image;

			return {
				id: section.id,
				heading: section.heading.trim(),
				body: section.body,
				...(image && {
					image: {
						src: image.src,
						alt: image.alt.trim(),
						...(!blank(image.caption) && { caption: image.caption.trim() }),
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

	return {
		page,
		meta: {
			summary: draft.summary.trim(),
			keywords: draft.keywords
				.split(/[,、]/)
				.map((word) => word.trim())
				.filter(Boolean),
			featured: draft.featured,
			popular: draft.popular
		}
	};
}

/**
 * The starting point for translating a guide into another language: the same structure, with the
 * text taken out. Keeping the section anchors means a link written to `#connect` in one language
 * still lands on the right section in the other.
 */
export function emptyCopyOf(page: PageDocument): PageDocument {
	return {
		slug: page.slug,
		topic: page.topic,
		title: '',
		intro: '',
		sections: page.sections.map(({ id, image }) => ({
			id,
			heading: '',
			body: [],
			...(image && {
				image: {
					src: image.src,
					alt: '',
					side: image.side,
					...(image.width && image.height && { width: image.width, height: image.height })
				}
			})
		})),
		...(page.links && { links: page.links.filter((link) => link.kind === 'page') }),
		...(page.video && { video: { url: page.video.url } })
	};
}
