import { describe, expect, it } from 'vitest';
import type { PageDocument, SiteIndex } from '#lib/site.ts';
import { applyPageToIndex, movePageInIndex, removePageFromIndex } from './index-update.ts';
import type { PageSave } from './page-draft.ts';

const index: SiteIndex = {
	topics: [
		{
			id: 'gateways',
			icon: 'gateway',
			title: 'Gateways',
			description: '',
			pages: ['installing-a-gateway', 'mounting']
		},
		{
			id: 'concepts',
			icon: 'concepts',
			title: 'Concepts',
			description: '',
			pages: []
		}
	],
	pages: {
		'installing-a-gateway': {
			topic: 'gateways',
			title: 'Installing a gateway',
			summary: 'Old summary',
			image: null,
			hasVideo: false
		},
		mounting: { topic: 'gateways', title: 'Mounting', summary: '', hasVideo: false }
	},
	featured: ['installing-a-gateway'],
	popular: []
};

const page: PageDocument = {
	slug: 'installing-a-gateway',
	topic: 'gateways',
	title: 'Installing a gateway',
	intro: 'Intro',
	sections: [
		{ id: 'first', heading: 'First', body: [] },
		{
			id: 'second',
			heading: 'Second',
			body: [],
			image: { src: 'images/installing-a-gateway/ports.webp', alt: 'Ports', side: 'right' }
		}
	],
	video: { url: 'https://youtu.be/dQw4w9WgXcQ' }
};

const save: PageSave = {
	page,
	meta: {
		summary: 'New summary',
		keywords: ['antenna'],
		featured: false,
		popular: true
	}
};

describe('applyPageToIndex', () => {
	it('refreshes the entry, takes the card picture from the first section that has one', () => {
		const next = applyPageToIndex(index, save);

		expect(next.pages['installing-a-gateway']).toEqual({
			topic: 'gateways',
			title: 'Installing a gateway',
			summary: 'New summary',
			image: 'images/installing-a-gateway/ports.webp',
			hasVideo: true,
			keywords: ['antenna']
		});
		expect(next.featured).toEqual([]);
		expect(next.popular).toEqual(['installing-a-gateway']);
	});

	it('keeps the menu order of a page that is already listed', () => {
		expect(applyPageToIndex(index, save).topics[0].pages).toEqual([
			'installing-a-gateway',
			'mounting'
		]);
	});

	it('moves a page that changed topic to the end of its new topic', () => {
		const moved = applyPageToIndex(index, { ...save, page: { ...page, topic: 'concepts' } });

		expect(moved.topics[0].pages).toEqual(['mounting']);
		expect(moved.topics[1].pages).toEqual(['installing-a-gateway']);
	});

	it('adds a page that is not listed yet', () => {
		const added = applyPageToIndex(index, {
			...save,
			page: { ...page, slug: 'antennas' }
		});

		expect(added.topics[0].pages).toEqual(['installing-a-gateway', 'mounting', 'antennas']);
		expect(added.pages).toHaveProperty('antennas');
	});

	it('leaves out keywords when none were given', () => {
		const bare = applyPageToIndex(index, { ...save, meta: { ...save.meta, keywords: [] } });
		expect(bare.pages['installing-a-gateway']).not.toHaveProperty('keywords');
	});
});

describe('removePageFromIndex', () => {
	it('takes the page out of its topic, the page list and the home page lists', () => {
		const next = removePageFromIndex(index, 'installing-a-gateway');

		expect(next.topics[0].pages).toEqual(['mounting']);
		expect(next.pages).not.toHaveProperty('installing-a-gateway');
		expect(next.featured).toEqual([]);
		expect(index.pages).toHaveProperty('installing-a-gateway');
	});
});

describe('movePageInIndex', () => {
	it('swaps a page with its neighbour', () => {
		expect(movePageInIndex(index, 'mounting', 'up').topics[0].pages).toEqual([
			'mounting',
			'installing-a-gateway'
		]);
	});

	it('does nothing at either end, or for a page it cannot find', () => {
		expect(movePageInIndex(index, 'installing-a-gateway', 'up').topics[0].pages).toEqual([
			'installing-a-gateway',
			'mounting'
		]);
		expect(movePageInIndex(index, 'mounting', 'down').topics[0].pages).toEqual([
			'installing-a-gateway',
			'mounting'
		]);
		expect(movePageInIndex(index, 'nope', 'up').topics[0].pages).toEqual(index.topics[0].pages);
	});
});
