/**
 * Reads and writes the website's content files in `../static/content`.
 *
 * Each language has a tree of its own, `<lang>/index.json` and `<lang>/pages/<slug>.json`, so a
 * page written in one language never appears in the other. Pictures are the exception: they sit
 * in `images/<slug>/` and both languages point at the same files.
 */
import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { LOCALES, type Locale, type PageDocument, type SiteIndex } from '#lib/site.ts';

/** The editor is started from its own folder (`editor/`), one level below the website project. */
export const REPO_ROOT = path.resolve(process.cwd(), '..');
export const CONTENT_DIR = path.join(REPO_ROOT, 'static', 'content');

/** The absolute path of a file under the content folder. Refuses anything that would land outside it. */
export function contentPath(relative: string): string {
	const absolute = path.resolve(CONTENT_DIR, relative);
	if (absolute !== CONTENT_DIR && !absolute.startsWith(CONTENT_DIR + path.sep)) {
		throw new Error(`"${relative}" is outside the content folder`);
	}
	return absolute;
}

/** Writes to a temporary file first, so a crash halfway never leaves a half-written page. */
async function writeSafely(relative: string, data: string | Uint8Array) {
	const target = contentPath(relative);
	await mkdir(path.dirname(target), { recursive: true });
	await writeFile(`${target}.tmp`, data);
	await rename(`${target}.tmp`, target);
}

const toJson = (value: unknown) => JSON.stringify(value, null, '\t') + '\n';

export async function readIndex(lang: Locale): Promise<SiteIndex> {
	return JSON.parse(await readFile(contentPath(`${lang}/index.json`), 'utf-8'));
}

export const writeIndex = (lang: Locale, index: SiteIndex) =>
	writeSafely(`${lang}/index.json`, toJson(index));

/** `null` when that language has no such page. */
export async function readPage(lang: Locale, slug: string): Promise<PageDocument | null> {
	try {
		return JSON.parse(await readFile(contentPath(`${lang}/pages/${slug}.json`), 'utf-8'));
	} catch (cause) {
		if ((cause as NodeJS.ErrnoException).code === 'ENOENT') return null;
		throw cause;
	}
}

export const writePage = (lang: Locale, page: PageDocument) =>
	writeSafely(`${lang}/pages/${page.slug}.json`, toJson(page));

/** Which languages this page is written in. */
export async function languagesWith(slug: string): Promise<Locale[]> {
	const found = await Promise.all(
		LOCALES.map(async (locale) => ((await readPage(locale, slug)) ? locale : null))
	);
	return found.filter((locale) => locale !== null);
}

/** Every picture any language's copy of this page points at. */
async function picturesInUse(slug: string): Promise<Set<string>> {
	const pages = await Promise.all(LOCALES.map((locale) => readPage(locale, slug)));
	return new Set(
		pages.flatMap((page) => page?.sections.flatMap((section) => section.image?.src ?? []) ?? [])
	);
}

/**
 * Removes this language's copy of the page. The pictures go too, but only once no other
 * language is still using them.
 */
export async function deletePageFiles(lang: Locale, slug: string) {
	await rm(contentPath(`${lang}/pages/${slug}.json`), { force: true });
	if ((await languagesWith(slug)).length === 0) {
		await rm(contentPath(`images/${slug}`), { recursive: true, force: true });
	}
}

/** Returns the picture's path as the page file should record it, e.g. `images/my-guide/ports.webp`. */
export async function writeImage(slug: string, filename: string, bytes: Uint8Array) {
	const relative = `images/${slug}/${filename}`;
	await writeSafely(relative, bytes);
	return relative;
}

/**
 * Pictures that were uploaded and then replaced or removed would otherwise pile up in the project.
 * Called after the page has been written, and it reads every language back, so a picture the
 * other language still shows is never swept away.
 */
export async function removeUnusedImages(slug: string) {
	const folder = contentPath(`images/${slug}`);
	const used = await picturesInUse(slug);

	for (const file of await readdir(folder).catch(() => [])) {
		if (!used.has(`images/${slug}/${file}`)) await rm(path.join(folder, file), { force: true });
	}
}
