import { describe, expect, it } from 'vitest';
import type { SiteIndex } from './content.ts';
import { buildSearchEntries, searchEntries } from './search.ts';

const index: SiteIndex = {
	topics: [
		{
			id: 'gateways',
			icon: 'gateway',
			title: { en: 'Gateways', ja: 'ゲートウェイ' },
			description: { en: '' },
			pages: ['installing-a-gateway', 'missing-from-pages']
		},
		{
			id: 'concepts',
			icon: 'concepts',
			title: { en: 'Concepts' },
			description: { en: '' },
			pages: ['vpd-explained']
		}
	],
	pages: {
		'installing-a-gateway': {
			topic: 'gateways',
			title: { en: 'Installing a gateway', ja: 'ゲートウェイの設置' },
			summary: { en: 'Unbox, mount and connect.' },
			hasVideo: true,
			keywords: { en: ['setup', 'antenna'] }
		},
		'vpd-explained': {
			topic: 'concepts',
			title: { en: 'VPD explained' },
			summary: { en: 'Temperature and humidity in one number. Useful next to a gateway? No.' },
			hasVideo: false
		}
	},
	featured: [],
	popular: []
};

describe('buildSearchEntries', () => {
	it('lists pages in menu order and skips slugs with no page', () => {
		expect(buildSearchEntries(index, 'en').map((entry) => entry.slug)).toEqual([
			'installing-a-gateway',
			'vpd-explained'
		]);
	});

	it('uses the requested language, falling back per field', () => {
		const [gateway, vpd] = buildSearchEntries(index, 'ja');
		expect(gateway.title).toBe('ゲートウェイの設置');
		expect(gateway.summary).toBe('Unbox, mount and connect.');
		expect(vpd.title).toBe('VPD explained');
	});
});

describe('searchEntries', () => {
	const en = buildSearchEntries(index, 'en');

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

	it('finds a translated page by its English title or keywords', () => {
		const ja = buildSearchEntries(index, 'ja');
		expect(searchEntries(ja, 'installing').map((entry) => entry.slug)).toEqual([
			'installing-a-gateway'
		]);
		expect(searchEntries(ja, 'antenna')).toHaveLength(1);
	});

	it('matches Japanese text and full-width characters', () => {
		const ja = buildSearchEntries(index, 'ja');
		expect(searchEntries(ja, '設置').map((entry) => entry.slug)).toEqual(['installing-a-gateway']);
		expect(searchEntries(ja, 'ＶＰＤ').map((entry) => entry.slug)).toEqual(['vpd-explained']);
	});
});
