/** Keeps one language's `index.json` in step with its page files. Every function returns a new index. */
import type { SiteIndex } from '#lib/site.ts';
import type { PageSave } from './page-draft.ts';

const toggle = (list: string[], slug: string, included: boolean) =>
	included ? (list.includes(slug) ? list : [...list, slug]) : list.filter((item) => item !== slug);

/** Adds or refreshes a page's entry. A page that changes topic goes to the end of its new topic. */
export function applyPageToIndex(index: SiteIndex, { page, meta }: PageSave): SiteIndex {
	return {
		topics: index.topics.map((topic) => {
			const others = topic.pages.filter((slug) => slug !== page.slug);
			if (topic.id !== page.topic) return { ...topic, pages: others };
			return topic.pages.includes(page.slug) ? topic : { ...topic, pages: [...others, page.slug] };
		}),
		pages: {
			...index.pages,
			[page.slug]: {
				topic: page.topic,
				title: page.title,
				summary: meta.summary,
				// The card on the home page shows the first picture in the guide.
				image: page.sections.find((section) => section.image?.src)?.image?.src ?? null,
				hasVideo: Boolean(page.video),
				...(meta.keywords.length > 0 && { keywords: meta.keywords })
			}
		},
		featured: toggle(index.featured, page.slug, meta.featured),
		popular: toggle(index.popular, page.slug, meta.popular)
	};
}

export function removePageFromIndex(index: SiteIndex, slug: string): SiteIndex {
	const pages = { ...index.pages };
	delete pages[slug];

	return {
		topics: index.topics.map((topic) => ({
			...topic,
			pages: topic.pages.filter((item) => item !== slug)
		})),
		pages,
		featured: index.featured.filter((item) => item !== slug),
		popular: index.popular.filter((item) => item !== slug)
	};
}

/** Moves a page one place up or down the menu of its topic. At either end nothing changes. */
export function movePageInIndex(
	index: SiteIndex,
	slug: string,
	direction: 'up' | 'down'
): SiteIndex {
	return {
		...index,
		topics: index.topics.map((topic) => {
			const from = topic.pages.indexOf(slug);
			const to = direction === 'up' ? from - 1 : from + 1;
			if (from === -1 || to < 0 || to >= topic.pages.length) return topic;

			const pages = [...topic.pages];
			[pages[from], pages[to]] = [pages[to], pages[from]];
			return { ...topic, pages };
		})
	};
}
