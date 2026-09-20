import { describe, expect, it } from 'vitest';
import type { PageDocument, SiteIndex } from '#lib/site.ts';
import { fromDraft, newDraft, toDraft } from './page-draft.ts';

const index: SiteIndex = {
	topics: [
		{
			id: 'gateways',
			icon: 'gateway',
			title: { en: 'Gateways' },
			description: { en: '' },
			pages: ['a-guide']
		}
	],
	pages: {
		'a-guide': {
			topic: 'gateways',
			title: { en: 'A guide', ja: 'ガイド' },
			summary: { en: 'Summary' },
			hasVideo: false,
			keywords: { en: ['antenna', 'setup'] }
		}
	},
	featured: ['a-guide'],
	popular: []
};

const page: PageDocument = {
	slug: 'a-guide',
	topic: 'gateways',
	title: { en: 'A guide', ja: 'ガイド' },
	intro: { en: 'Intro' },
	sections: [
		{
			id: 'first',
			heading: { en: 'First', ja: '最初' },
			body: { en: [{ type: 'paragraph', content: [{ text: 'Body' }] }] },
			image: {
				src: 'images/a-guide/one.webp',
				alt: { en: 'A picture' },
				caption: { en: 'Caption' },
				side: 'left',
				width: 1600,
				height: 900
			}
		}
	],
	links: [{ kind: 'page', slug: 'other' }],
	video: { url: 'https://youtu.be/dQw4w9WgXcQ' }
};

describe('a page loaded for editing and saved again', () => {
	it('comes back unchanged when nothing was typed', () => {
		expect(fromDraft(toDraft(page, index)).page).toEqual(page);
	});

	it('carries the parts that live in index.json', () => {
		const draft = toDraft(page, index);

		expect(draft.summary.en).toBe('Summary');
		expect(draft.keywords.en).toBe('antenna, setup');
		expect(draft.featured).toBe(true);
		expect(fromDraft(draft).meta).toEqual({
			summary: { en: 'Summary' },
			keywords: { en: ['antenna', 'setup'] },
			featured: true,
			popular: false
		});
	});

	it('gives every language a box to type in, and saves only what was written', () => {
		const draft = toDraft(page, index);
		expect(draft.intro.ja).toBe('');

		draft.intro.ja = '  はじめに  ';
		const saved = fromDraft(draft).page;

		expect(saved.intro).toEqual({ en: 'Intro', ja: 'はじめに' });
		expect(saved.sections[0].body).not.toHaveProperty('ja');
	});

	it('drops links and a video that were left empty', () => {
		const draft = newDraft('gateways');
		draft.slug = 'new-guide';
		draft.title.en = 'New guide';
		draft.links = [
			{ key: '1', kind: 'page', slug: '' },
			{ key: '2', kind: 'url', href: '', label: { en: '', ja: '' } }
		];
		draft.videoUrl = '   ';

		const saved = fromDraft(draft).page;
		expect(saved).not.toHaveProperty('links');
		expect(saved).not.toHaveProperty('video');
	});

	it('splits keywords on commas, English or Japanese', () => {
		const draft = newDraft('gateways');
		draft.keywords.en = ' antenna , ethernet ,, ';
		draft.keywords.ja = 'アンテナ、設定';

		expect(fromDraft(draft).meta.keywords).toEqual({
			en: ['antenna', 'ethernet'],
			ja: ['アンテナ', '設定']
		});
	});
});
