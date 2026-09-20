/**
 * The shape of the JSON files in `static/content/`.
 *
 * `index.json` holds everything needed for navigation and search.
 * `pages/<slug>.json` holds one full page, in every language.
 */
import type { Localized } from './locale.ts';

export type TopicIcon = 'hardware' | 'software' | 'gateway' | 'concepts';

/** A run of text. `href` is a web address, or `page:<slug>` / `page:<slug>#<section-id>` for another page. */
export type InlineNode = {
	text: string;
	bold?: boolean;
	italic?: boolean;
	href?: string;
};

export type Block =
	| { type: 'paragraph'; content: InlineNode[] }
	| { type: 'list'; ordered: boolean; items: InlineNode[][] }
	| { type: 'note'; content: InlineNode[] };

export type SectionImage = {
	/** Path relative to `static/content/`, or `null` while the picture is still to come. */
	src: string | null;
	alt: Localized<string>;
	caption?: Localized<string>;
	side: 'left' | 'right';
	width?: number;
	height?: number;
};

export type SectionRecord = {
	/** The anchor in the URL (`#id`). Shared by every language so external links keep working. */
	id: string;
	heading: Localized<string>;
	body: Localized<Block[]>;
	image?: SectionImage;
};

export type LinkRecord =
	{ kind: 'page'; slug: string } | { kind: 'url'; href: string; label: Localized<string> };

export type VideoRecord = {
	/** Any YouTube link: watch, share, shorts or embed. */
	url: string;
	title?: Localized<string>;
};

export type PageDocument = {
	slug: string;
	topic: string;
	title: Localized<string>;
	intro: Localized<string>;
	sections: SectionRecord[];
	links?: LinkRecord[];
	video?: VideoRecord;
};

export type PageSummary = {
	topic: string;
	title: Localized<string>;
	summary: Localized<string>;
	/** Card picture, relative to `static/content/`. */
	image?: string | null;
	hasVideo: boolean;
	keywords?: Localized<string[]>;
};

export type TopicRecord = {
	id: string;
	icon: TopicIcon;
	title: Localized<string>;
	description: Localized<string>;
	/** Page slugs, in menu order. */
	pages: string[];
};

export type SiteIndex = {
	topics: TopicRecord[];
	pages: Record<string, PageSummary>;
	/** Slugs shown under "Start here" on the home page. */
	featured: string[];
	/** Slugs shown as quick links under the home page search box. */
	popular: string[];
};
