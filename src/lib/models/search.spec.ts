import { describe, expect, it } from 'vitest';
import type { SiteIndex } from './content.ts';
import { buildSearchEntries, searchEntries } from './search.ts';

const index: SiteIndex = {
	topics: [
		{
			id: 'gateways',
			icon: 'gateway',
			title: 'Gateways',
			description: '',
			pages: ['installing-a-gateway', 'missing-from-pages']
		},
		{
			id: 'concepts',
			icon: 'concepts',
			title: 'Concepts',
			description: '',
			pages: ['vpd-explained']
		}
	],
	pages: {
		'installing-a-gateway': {
			topic: 'gateways',
			title: 'Installing a gateway',
			summary: 'Unbox, mount and connect.',
			hasVideo: true,
			keywords: ['setup', 'antenna']
		},
		'vpd-explained': {
			topic: 'concepts',
			title: 'VPD explained',
			summary: 'Temperature and humidity in one number. Useful next to a gateway? No.',
			hasVideo: false
		}
	},
	featured: [],
	popular: []
};

const japanese: SiteIndex = {
	topics: [
		{
			id: 'gateways',
			icon: 'gateway',
			title: 'ゲートウェイ',
			description: '',
			pages: ['installing-a-gateway']
		},
		{
			id: 'concepts',
			icon: 'concepts',
			title: '基礎知識',
			description: '',
			pages: ['vpd-explained']
		}
	],
	pages: {
		'installing-a-gateway': {
			topic: 'gateways',
			title: 'ゲートウェイの設置',
			summary: '開封して設置し、接続します。',
			hasVideo: true,
			keywords: ['アンテナ', 'antenna']
		},
		'vpd-explained': {
			topic: 'concepts',
			title: 'VPD（飽差）とは',
			summary: '温度と湿度を1つの数値に。',
			hasVideo: false
		}
	},
	featured: [],
	popular: []
};

describe('buildSearchEntries', () => {
	it('lists pages in menu order and skips slugs with no page', () => {
		expect(buildSearchEntries(index).map((entry) => entry.slug)).toEqual([
			'installing-a-gateway',
			'vpd-explained'
		]);
	});
});

describe('searchEntries', () => {
	const en = buildSearchEntries(index);

	it('returns nothing for a blank query', () => {
		expect(searchEntries(en, '   ')).toEqual([]);
	});

	it('ranks a title match above a summary match', () => {
		expect(searchEntries(en, 'gateway').map((entry) => entry.slug)).toEqual([
			'installing-a-gateway',
			'vpd-explained'
		]);
	});

	it('matches keywords and the topic name, ignoring case', () => {
		expect(searchEntries(en, 'ANTENNA').map((entry) => entry.slug)).toEqual([
			'installing-a-gateway'
		]);
		expect(searchEntries(en, 'concepts').map((entry) => entry.slug)).toEqual(['vpd-explained']);
	});

	it('requires every word to match', () => {
		expect(searchEntries(en, 'gateway antenna')).toHaveLength(1);
		expect(searchEntries(en, 'gateway tractor')).toEqual([]);
	});

	it('matches Japanese text and full-width characters', () => {
		const ja = buildSearchEntries(japanese);
		expect(searchEntries(ja, '設置').map((entry) => entry.slug)).toEqual(['installing-a-gateway']);
		expect(searchEntries(ja, 'ＶＰＤ').map((entry) => entry.slug)).toEqual(['vpd-explained']);
	});

	it('finds a Japanese page by an English keyword written into it', () => {
		// Nothing falls back across languages any more, so product words that readers type in
		// English have to be listed as keywords on the Japanese page itself.
		const ja = buildSearchEntries(japanese);
		expect(searchEntries(ja, 'antenna').map((entry) => entry.slug)).toEqual([
			'installing-a-gateway'
		]);
	});
});
