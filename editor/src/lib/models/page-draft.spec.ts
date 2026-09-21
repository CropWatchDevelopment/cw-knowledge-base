import { describe, expect, it } from 'vitest';
import type { PageDocument, SiteIndex } from '#lib/site.ts';
import { emptyCopyOf, fromDraft, newDraft, toDraft } from './page-draft.ts';

const index: SiteIndex = {
	topics: [
		{ id: 'gateways', icon: 'gateway', title: 'Gateways', description: '', pages: ['a-guide'] }
	],
	pages: {
		'a-guide': {
			topic: 'gateways',
			title: 'A guide',
			summary: 'Summary',
			hasVideo: false,
			keywords: ['antenna', 'setup']
		}
	},
	featured: ['a-guide'],
	popular: []
};

const page: PageDocument = {
	slug: 'a-guide',
	topic: 'gateways',
	title: 'A guide',
	intro: 'Intro',
	sections: [
		{
			id: 'first',
			heading: 'First',
			body: [{ type: 'paragraph', content: [{ text: 'Body' }] }],
			image: {
				src: 'images/a-guide/one.webp',
				alt: 'A picture',
				caption: 'Caption',
				side: 'left',
				width: 1600,
				height: 900
			}
		}
	],
	links: [
		{ kind: 'page', slug: 'other' },
		{ kind: 'url', href: 'https://www.cropwatch.io', label: 'Website' }
	],
	video: { url: 'https://youtu.be/dQw4w9WgXcQ' }
};

describe('a page loaded for editing and saved again', () => {
	it('comes back unchanged when nothing was typed', () => {
		expect(fromDraft(toDraft(page, index)).page).toEqual(page);
	});

	it('carries the parts that live in index.json', () => {
		const draft = toDraft(page, index);

		expect(draft.summary).toBe('Summary');
		expect(draft.keywords).toBe('antenna, setup');
		expect(draft.featured).toBe(true);
		expect(fromDraft(draft).meta).toEqual({
			summary: 'Summary',
			keywords: ['antenna', 'setup'],
			featured: true,
			popular: false
		});
	});

	it('trims what was typed', () => {
		const draft = toDraft(page, index);
		draft.intro = '  Something else  ';
		expect(fromDraft(draft).page.intro).toBe('Something else');
	});

	it('drops links and a video that were left empty', () => {
		const draft = newDraft('gateways');
		draft.slug = 'new-guide';
		draft.title = 'New guide';
		draft.links = [
			{ key: '1', kind: 'page', slug: '' },
			{ key: '2', kind: 'url', href: '', label: '' }
		];
		draft.videoUrl = '   ';

		const saved = fromDraft(draft).page;
		expect(saved).not.toHaveProperty('links');
		expect(saved).not.toHaveProperty('video');
	});

	it('splits keywords on commas, English or Japanese', () => {
		const draft = newDraft('gateways');
		draft.keywords = ' antenna , ethernet ,, アンテナ、設定';

		expect(fromDraft(draft).meta.keywords).toEqual(['antenna', 'ethernet', 'アンテナ', '設定']);
	});
});

describe('emptyCopyOf', () => {
	const copy = emptyCopyOf(page);

	it('keeps the structure so the two languages line up', () => {
		expect(copy.slug).toBe('a-guide');
		expect(copy.topic).toBe('gateways');
		expect(copy.sections.map((section) => section.id)).toEqual(['first']);
		expect(copy.sections[0].image?.src).toBe('images/a-guide/one.webp');
		expect(copy.video).toEqual({ url: 'https://youtu.be/dQw4w9WgXcQ' });
	});

	it('leaves every piece of text to be written', () => {
		expect(copy.title).toBe('');
		expect(copy.intro).toBe('');
		expect(copy.sections[0].heading).toBe('');
		expect(copy.sections[0].body).toEqual([]);
		expect(copy.sections[0].image?.alt).toBe('');
		expect(copy.sections[0].image).not.toHaveProperty('caption');
	});

	it('keeps links to other pages but not ones whose text would need translating', () => {
		expect(copy.links).toEqual([{ kind: 'page', slug: 'other' }]);
	});
});
