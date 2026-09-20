import { describe, expect, it } from 'vitest';
import type { Block } from '#lib/site.ts';
import { blocksToDoc, blocksToPlainText, docToBlocks } from './rich-text-doc.ts';

const blocks: Block[] = [
	{
		type: 'paragraph',
		content: [
			{ text: 'See ' },
			{ text: 'the gateway guide', href: 'page:installing-a-gateway#connect' },
			{ text: ' and keep it ' },
			{ text: 'powered', bold: true },
			{ text: '.' }
		]
	},
	{ type: 'list', ordered: true, items: [[{ text: 'First' }], [{ text: 'Second', italic: true }]] },
	{ type: 'list', ordered: false, items: [[{ text: 'A point' }]] },
	{ type: 'note', content: [{ text: 'Keep the gateway powered.' }] }
];

describe('the round trip through the text editor', () => {
	it('keeps paragraphs, both kinds of list, notes, bold, italic and links', () => {
		expect(docToBlocks(blocksToDoc(blocks))).toEqual(blocks);
	});

	it('drops empty paragraphs and empty list items', () => {
		const doc = {
			type: 'doc',
			content: [
				{ type: 'paragraph' },
				{ type: 'paragraph', content: [{ type: 'text', text: '  ' }] },
				{
					type: 'bulletList',
					content: [
						{ type: 'listItem', content: [{ type: 'paragraph' }] },
						{
							type: 'listItem',
							content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Kept' }] }]
						}
					]
				}
			]
		};

		expect(docToBlocks(doc)).toEqual([
			{ type: 'list', ordered: false, items: [[{ text: 'Kept' }]] }
		]);
	});

	it('merges neighbouring runs that are formatted the same way', () => {
		const doc = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: 'one ' },
						{ type: 'text', text: 'and two' },
						{ type: 'text', text: ' bold', marks: [{ type: 'bold' }] }
					]
				}
			]
		};

		expect(docToBlocks(doc)).toEqual([
			{ type: 'paragraph', content: [{ text: 'one and two' }, { text: ' bold', bold: true }] }
		]);
	});

	it('ignores formatting the website cannot show', () => {
		const doc = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [{ type: 'text', text: 'struck', marks: [{ type: 'strike' }] }]
				}
			]
		};

		expect(docToBlocks(doc)).toEqual([{ type: 'paragraph', content: [{ text: 'struck' }] }]);
	});
});

describe('blocksToPlainText', () => {
	it('reads as the page does, for use as a translation reference', () => {
		expect(blocksToPlainText(blocks.slice(1, 3))).toBe('1. First\n2. Second\n\n• A point');
	});
});
