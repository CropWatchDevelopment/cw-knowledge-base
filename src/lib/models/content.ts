/**
 * The shape of the JSON files in `static/content/`.
 *
 * Each language has a tree of its own: `<lang>/index.json` holds everything needed for
 * navigation and search, and `<lang>/pages/<slug>.json` holds one full page. A page written in
 * one language does not exist in the other until somebody writes it there, so nothing written
 * for English can surface on the Japanese site or the other way round.
 *
 * Pictures are shared, at `images/<slug>/`, since a diagram rarely needs redrawing per language.
 */

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
	alt: string;
	caption?: string;
	side: 'left' | 'right';
	width?: number;
	height?: number;
};

export type SectionRecord = {
	/** The anchor in the URL (`#id`). Shared by every language so external links keep working. */
	id: string;
	heading: string;
	body: Block[];
	image?: SectionImage;
};

export type LinkRecord =
	{ kind: 'page'; slug: string } | { kind: 'url'; href: string; label: string };

export type VideoRecord = {
	/** Any YouTube link: watch, share, shorts or embed. */
	url: string;
	title?: string;
};

export type PageDocument = {
	slug: string;
	topic: string;
	title: string;
	intro: string;
	sections: SectionRecord[];
	links?: LinkRecord[];
	video?: VideoRecord;
};

export type PageSummary = {
	topic: string;
	title: string;
	summary: string;
	/** Card picture, relative to `static/content/`. */
	image?: string | null;
	hasVideo: boolean;
	keywords?: string[];
};

export type TopicRecord = {
	id: string;
	icon: TopicIcon;
	title: string;
	description: string;
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
