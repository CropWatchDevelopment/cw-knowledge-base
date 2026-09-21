/**
 * Checks the real files in `static/content/`, so a broken link, a missing page or a page that
 * strayed into the wrong language fails here with a clear message instead of as a 404 on the site.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { InlineNode, PageDocument, SiteIndex } from './content.ts';
import { LOCALES } from './locale.ts';

const read = <T>(file: string): T => JSON.parse(readFileSync(`static/content/${file}`, 'utf-8'));

const ANCHOR = /^[a-z0-9]+(-[a-z0-9]+)*$/;

for (const lang of LOCALES) {
	const index = read<SiteIndex>(`${lang}/index.json`);
	const listed = index.topics.flatMap((topic) => topic.pages.map((slug) => ({ slug, topic })));

	describe(`${lang}/index.json`, () => {
		it('lists every page in exactly one topic, and only pages that exist', () => {
			expect(listed.map((entry) => entry.slug).sort()).toEqual(Object.keys(index.pages).sort());
			for (const { slug, topic } of listed) {
				expect(index.pages[slug].topic, slug).toBe(topic.id);
				expect(existsSync(`static/content/${lang}/pages/${slug}.json`), slug).toBe(true);
			}
		});

		it('only features and promotes pages that exist', () => {
			for (const slug of [...index.featured, ...index.popular]) {
				expect(index.pages, slug).toHaveProperty(slug);
			}
		});

		it('has no page file that the index does not list', () => {
			const files = readdirSync(`static/content/${lang}/pages`).map((name) =>
				name.replace(/\.json$/, '')
			);
			expect(files.sort()).toEqual(Object.keys(index.pages).sort());
		});
	});

	describe.each(listed)(`${lang}/pages/$slug.json`, ({ slug, topic }) => {
		const page = read<PageDocument>(`${lang}/pages/${slug}.json`);

		it('agrees with the index', () => {
			expect(page.slug).toBe(slug);
			expect(page.topic).toBe(topic.id);
			expect(page.title).toEqual(index.pages[slug].title);
			expect(Boolean(page.video)).toBe(index.pages[slug].hasVideo);
		});

		it('has unique, URL-safe section anchors that avoid the built-in ones', () => {
			const ids = page.sections.map((section) => section.id);
			expect(new Set(ids).size).toBe(ids.length);
			for (const id of ids) {
				expect(id).toMatch(ANCHOR);
				expect(['related-links', 'video']).not.toContain(id);
			}
		});

		it('links only to pages, sections and pictures in this language', () => {
			const inline: InlineNode[] = page.sections.flatMap((section) =>
				section.body.flatMap((block) =>
					block.type === 'list' ? block.items.flat() : block.content
				)
			);
			const targets = [
				...inline.flatMap((node) => (node.href?.startsWith('page:') ? [node.href.slice(5)] : [])),
				...(page.links ?? []).flatMap((link) => (link.kind === 'page' ? [link.slug] : []))
			];

			for (const target of targets) {
				const [targetSlug, anchor] = target.split('#');
				expect(index.pages, target).toHaveProperty(targetSlug);
				if (anchor) {
					const sections = read<PageDocument>(`${lang}/pages/${targetSlug}.json`).sections;
					expect(
						sections.map((section) => section.id),
						target
					).toContain(anchor);
				}
			}

			for (const section of page.sections) {
				if (section.image?.src) {
					expect(existsSync(`static/content/${section.image.src}`), section.image.src).toBe(true);
				}
			}

			expect(page.sections.length).toBeGreaterThan(0);
		});
	});
}

describe('the language trees', () => {
	it('keeps each language in its own directory, with pictures shared', () => {
		const top = readdirSync('static/content', { withFileTypes: true });
		expect(top.map((entry) => entry.name).sort()).toEqual([...LOCALES, 'images'].sort());
		expect(top.every((entry) => entry.isDirectory())).toBe(true);
	});
});
