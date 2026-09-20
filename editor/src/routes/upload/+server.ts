import { error, json } from '@sveltejs/kit';
import { SLUG_PATTERN, slugify } from '#lib/models/slug.ts';
import { writeImage } from '#lib/server/content-files.ts';
import type { RequestHandler } from './$types';

const EXTENSIONS: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/gif': 'gif'
};
const MAX_BYTES = 10 * 1024 * 1024;

/** Stores a picture in the page's folder and answers with the path to record in the page file. */
export const POST: RequestHandler = async ({ request }) => {
	const form = await request.formData();
	const slug = form.get('slug');
	const file = form.get('file');

	if (typeof slug !== 'string' || !SLUG_PATTERN.test(slug)) {
		error(400, 'Give the page a title before adding pictures.');
	}
	if (!(file instanceof File)) error(400, 'No picture was received.');

	const extension = EXTENSIONS[file.type];
	if (!extension) error(415, 'Pictures must be JPEG, PNG, WebP or GIF files.');
	if (file.size > MAX_BYTES) error(413, 'That picture is larger than 10 MB.');

	// A short time stamp keeps a replaced picture from being mistaken for the cached old one.
	const name = slugify(file.name.replace(/\.[^.]+$/, '')) || 'picture';
	const filename = `${name}-${Date.now().toString(36)}.${extension}`;

	return json({ src: await writeImage(slug, filename, new Uint8Array(await file.arrayBuffer())) });
};
