import { error } from '@sveltejs/kit';
import type { Block, InlineNode, SiteIndex } from '#lib/models/content.ts';
import type { ContentRepository } from '#lib/models/content-repository.ts';
import { isTranslated, localize, type Locale } from '#lib/models/locale.ts';
import { youtubeId } from '#lib/models/video.ts';

export type InlineLink =
	{ kind: 'page'; topic: string; slug: string; hash: string } | { kind: 'url'; href: string };

export type InlineView = {
	text: string;
	bold: boolean;
	italic: boolean;
	link: InlineLink | null;
};

export type BlockView =
	| { type: 'paragraph'; content: InlineView[] }
	| { type: 'list'; ordered: boolean; items: InlineView[][] }
	| { type: 'note'; content: InlineView[] };

export type SectionView = {
	id: string;
	heading: string;
	blocks: BlockView[];
	image: {
		src: string | null;
		alt: string;
		caption: string | null;
		side: 'left' | 'right';
		width?: number;
		height?: number;
	} | null;
};

export type RelatedLinkView =
	| { kind: 'page'; topic: string; slug: string; title: string; topicTitle: string }
	| { kind: 'url'; href: string; label: string };

export type ArticleData = {
	slug: string;
	topic: { id: string; title: string };
	title: string;
	intro: string;
	/** False when the page is shown in the default language because `lang` is not written yet. */
	translated: boolean;
	sections: SectionView[];
	links: RelatedLinkView[];
	video: { id: string; title: string } | null;
};

export async function loadArticle(
	content: ContentRepository,
	index: SiteIndex,
	lang: Locale,
	topicId: string,
	slug: string
): Promise<ArticleData> {
	const topic = index.topics.find((candidate) => candidate.id === topicId);
	const page = topic?.pages.includes(slug) ? await content.page(slug) : null;
	if (!topic || !page) error(404, 'Not found');

	/** `page:<slug>#<id>` becomes a link to that page in the reader's language; unknown pages lose the link. */
	const toInline = (node: InlineNode): InlineView => {
		let link: InlineLink | null = null;

		if (node.href?.startsWith('page:')) {
			const [target, hash = ''] = node.href.slice('page:'.length).split('#');
			const targetTopic = index.pages[target]?.topic;
			if (targetTopic) link = { kind: 'page', topic: targetTopic, slug: target, hash };
		} else if (node.href) {
			link = { kind: 'url', href: node.href };
		}

		return { text: node.text, bold: node.bold ?? false, italic: node.italic ?? false, link };
	};

	const toBlock = (block: Block): BlockView =>
		block.type === 'list'
			? { ...block, items: block.items.map((item) => item.map(toInline)) }
			: { ...block, content: block.content.map(toInline) };

	const title = localize(page.title, lang);
	const videoId = page.video ? youtubeId(page.video.url) : null;

	return {
		slug,
		topic: { id: topic.id, title: localize(topic.title, lang) },
		title,
		intro: localize(page.intro, lang),
		translated: isTranslated(page.title, lang),
		sections: page.sections.map((section) => ({
			id: section.id,
			heading: localize(section.heading, lang),
			blocks: localize(section.body, lang).map(toBlock),
			image: section.image
				? {
						src: section.image.src,
						alt: localize(section.image.alt, lang),
						caption: section.image.caption ? localize(section.image.caption, lang) : null,
						side: section.image.side,
						width: section.image.width,
						height: section.image.height
					}
				: null
		})),
		links: (page.links ?? []).flatMap((link): RelatedLinkView[] => {
			if (link.kind === 'url') {
				return [{ kind: 'url', href: link.href, label: localize(link.label, lang) }];
			}
			const target = index.pages[link.slug];
			const targetTopic = target && index.topics.find((candidate) => candidate.id === target.topic);
			if (!target || !targetTopic) return [];
			return [
				{
					kind: 'page',
					topic: targetTopic.id,
					slug: link.slug,
					title: localize(target.title, lang),
					topicTitle: localize(targetTopic.title, lang)
				}
			];
		}),
		video: videoId
			? { id: videoId, title: page.video?.title ? localize(page.video.title, lang) : title }
			: null
	};
}
