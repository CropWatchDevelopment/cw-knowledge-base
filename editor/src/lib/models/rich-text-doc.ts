/**
 * Converts between the site's text blocks and the document format of the on-screen text editor
 * (Tiptap / ProseMirror JSON). Only what the site can show survives the trip:
 * paragraphs, bulleted and numbered lists, notes, bold, italic and links.
 */
import type { Block, InlineNode } from '#lib/site.ts';

export type DocNode = {
	type?: string;
	text?: string;
	attrs?: Record<string, unknown>;
	marks?: { type: string; attrs?: Record<string, unknown> }[];
	content?: DocNode[];
};

function toTextNodes(nodes: InlineNode[]): DocNode[] {
	return nodes
		.filter((node) => node.text !== '')
		.map((node) => {
			const marks = [
				...(node.bold ? [{ type: 'bold' }] : []),
				...(node.italic ? [{ type: 'italic' }] : []),
				...(node.href ? [{ type: 'link', attrs: { href: node.href } }] : [])
			];
			return marks.length > 0
				? { type: 'text', text: node.text, marks }
				: { type: 'text', text: node.text };
		});
}

const paragraph = (nodes: InlineNode[]): DocNode => {
	const content = toTextNodes(nodes);
	return content.length > 0 ? { type: 'paragraph', content } : { type: 'paragraph' };
};

export function blocksToDoc(blocks: Block[]): DocNode {
	return {
		type: 'doc',
		content: blocks.map((block) => {
			if (block.type === 'list') {
				return {
					type: block.ordered ? 'orderedList' : 'bulletList',
					content: block.items.map((item) => ({ type: 'listItem', content: [paragraph(item)] }))
				};
			}
			if (block.type === 'note') return { type: 'blockquote', content: [paragraph(block.content)] };
			return paragraph(block.content);
		})
	};
}

/** The text runs inside `node`, however deeply nested. Neighbours with the same formatting are merged. */
function toInline(node: DocNode): InlineNode[] {
	const runs: InlineNode[] = [];

	const visit = (current: DocNode) => {
		if (current.type === 'hardBreak') {
			runs.push({ text: ' ' });
			return;
		}

		if (current.type === 'text' && current.text) {
			const run: InlineNode = { text: current.text };
			for (const mark of current.marks ?? []) {
				if (mark.type === 'bold') run.bold = true;
				if (mark.type === 'italic') run.italic = true;
				if (mark.type === 'link' && typeof mark.attrs?.href === 'string')
					run.href = mark.attrs.href;
			}

			const previous = runs.at(-1);
			if (
				previous &&
				previous.bold === run.bold &&
				previous.italic === run.italic &&
				previous.href === run.href
			) {
				previous.text += run.text;
			} else {
				runs.push(run);
			}
			return;
		}

		// A nested block (a second paragraph in a list item, say) continues the same line.
		if (runs.length > 0 && current.type === 'paragraph') runs.push({ text: ' ' });
		current.content?.forEach(visit);
	};

	visit(node);
	return runs;
}

const hasText = (nodes: InlineNode[]) => nodes.some((node) => node.text.trim() !== '');

export function docToBlocks(doc: DocNode): Block[] {
	return (doc.content ?? []).flatMap((node): Block[] => {
		if (node.type === 'bulletList' || node.type === 'orderedList') {
			const items = (node.content ?? []).map(toInline).filter(hasText);
			return items.length > 0
				? [{ type: 'list', ordered: node.type === 'orderedList', items }]
				: [];
		}

		const content = toInline(node);
		if (!hasText(content)) return [];
		return [{ type: node.type === 'blockquote' ? 'note' : 'paragraph', content }];
	});
}

/** The words only, for showing the English text as a reference while translating. */
export function blocksToPlainText(blocks: Block[]): string {
	const line = (nodes: InlineNode[]) => nodes.map((node) => node.text).join('');

	return blocks
		.map((block) =>
			block.type === 'list'
				? block.items
						.map((item, i) => `${block.ordered ? `${i + 1}.` : '•'} ${line(item)}`)
						.join('\n')
				: line(block.content)
		)
		.join('\n\n');
}
