import { describe, expect, it } from 'vitest';
import type { PageDocument, SiteIndex } from '#lib/models/content.ts';
import type { ContentRepository } from '#lib/models/content-repository.ts';
import { loadArticle } from './article.controller.ts';

const index: SiteIndex = {
	topics: [
		{
			id: 'gateways',
			icon: 'gateway',
			title: { en: 'Gateways', ja: 'ゲートウェイ' },
			description: { en: '' },
			pages: ['installing-a-gateway', 'mounting']
		}
	],
	pages: {
		'installing-a-gateway': {
			topic: 'gateways',
			title: { en: 'Installing a gateway' },
			summary: { en: '' },
			hasVideo: true
		},
		mounting: {
			topic: 'gateways',
			title: { en: 'Mounting', ja: '設置場所' },
			summary: { en: '' },
			hasVideo: false
		}
	},
	featured: [],
	popular: []
};

const document: PageDocument = {
	slug: 'installing-a-gateway',
	topic: 'gateways',
	title: { en: 'Installing a gateway' },
	intro: { en: 'Intro' },
	sections: [
		{
			id: 'connect',
			heading: { en: 'Connect', ja: '接続する' },
			body: {
				en: [
					{
						type: 'paragraph',
						content: [
							{ text: 'See ' },
							{ text: 'Mounting', href: 'page:mounting#go-high' },
							{ text: ', ' },
							{ text: 'gone', href: 'page:deleted-page' },
							{ text: ' or ' },
							{ text: 'the site', href: 'https://www.cropwatch.io', bold: true }
						]
					}
				]
			}
		}
	],
	links: [
		{ kind: 'page', slug: 'mounting' },
		{ kind: 'page', slug: 'deleted-page' },
		{ kind: 'url', href: 'https://www.cropwatch.io', label: { en: 'Website' } }
	],
	video: { url: 'https://youtu.be/dQw4w9WgXcQ' }
};

const content = {
	page: async (slug: string) => (slug === document.slug ? document : null)
} as ContentRepository;

describe('loadArticle', () => {
	it('localizes each field on its own and reports an untranslated page', async () => {
		const article = await loadArticle(content, index, 'ja', 'gateways', 'installing-a-gateway');

		expect(article.translated).toBe(false);
		expect(article.title).toBe('Installing a gateway');
		expect(article.topic.title).toBe('ゲートウェイ');
		expect(article.sections[0].heading).toBe('接続する');
	});

	it('turns page: links into routes and drops links to pages that no longer exist', async () => {
		const article = await loadArticle(content, index, 'en', 'gateways', 'installing-a-gateway');
		const [block] = article.sections[0].blocks;
		const links = block.type === 'paragraph' ? block.content.map((node) => node.link) : [];

		expect(links).toEqual([
			null,
			{ kind: 'page', topic: 'gateways', slug: 'mounting', hash: 'go-high' },
			null,
			null,
			null,
			{ kind: 'url', href: 'https://www.cropwatch.io' }
		]);
		expect(article.links.map((link) => (link.kind === 'page' ? link.slug : link.href))).toEqual([
			'mounting',
			'https://www.cropwatch.io'
		]);
	});

	it('reads the video id and titles the video after the page by default', async () => {
		const article = await loadArticle(content, index, 'en', 'gateways', 'installing-a-gateway');
		expect(article.video).toEqual({ id: 'dQw4w9WgXcQ', title: 'Installing a gateway' });
	});

	it('responds 404 for an unknown topic, an unknown page, or a page filed under another topic', async () => {
		await expect(
			loadArticle(content, index, 'en', 'nope', 'installing-a-gateway')
		).rejects.toMatchObject({ status: 404 });
		await expect(loadArticle(content, index, 'en', 'gateways', 'nope')).rejects.toMatchObject({
			status: 404
		});
		await expect(loadArticle(content, index, 'en', 'gateways', 'mounting')).rejects.toMatchObject({
			status: 404
		});
	});
});
