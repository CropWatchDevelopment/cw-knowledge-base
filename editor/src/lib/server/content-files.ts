/** Reads and writes the website's content files in `../static/content`. */
import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { PageDocument, SiteIndex } from '#lib/site.ts';

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

export async function readIndex(): Promise<SiteIndex> {
	return JSON.parse(await readFile(contentPath('index.json'), 'utf-8'));
}

export const writeIndex = (index: SiteIndex) => writeSafely('index.json', toJson(index));

/** `null` when there is no such page. */
export async function readPage(slug: string): Promise<PageDocument | null> {
	try {
		return JSON.parse(await readFile(contentPath(`pages/${slug}.json`), 'utf-8'));
	} catch (cause) {
		if ((cause as NodeJS.ErrnoException).code === 'ENOENT') return null;
		throw cause;
	}
}

export const writePage = (page: PageDocument) =>
	writeSafely(`pages/${page.slug}.json`, toJson(page));

/** Removes the page file and the folder holding its pictures. */
export async function deletePageFiles(slug: string) {
	await rm(contentPath(`pages/${slug}.json`), { force: true });
	await rm(contentPath(`images/${slug}`), { recursive: true, force: true });
}

/** Returns the picture's path as the page file should record it, e.g. `images/my-guide/ports.webp`. */
export async function writeImage(slug: string, filename: string, bytes: Uint8Array) {
	const relative = `images/${slug}/${filename}`;
	await writeSafely(relative, bytes);
	return relative;
}

/** Pictures that were uploaded and then replaced or removed would otherwise pile up in the project. */
export async function removeUnusedImages(page: PageDocument) {
	const folder = contentPath(`images/${page.slug}`);
	const used = new Set(page.sections.map((section) => section.image?.src));

	for (const file of await readdir(folder).catch(() => [])) {
		if (!used.has(`images/${page.slug}/${file}`))
			await rm(path.join(folder, file), { force: true });
	}
}
