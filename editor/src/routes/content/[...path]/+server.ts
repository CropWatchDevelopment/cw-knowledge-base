import { error } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import { contentPath } from '#lib/server/content-files.ts';
import type { RequestHandler } from './$types';

const TYPES: Record<string, string> = {
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	webp: 'image/webp',
	gif: 'image/gif',
	svg: 'image/svg+xml'
};

/** Shows pictures from the website's content folder inside the editor. */
export const GET: RequestHandler = async ({ params }) => {
	const type = TYPES[params.path.split('.').pop()?.toLowerCase() ?? ''];
	if (!type) error(404, 'Not found');

	try {
		return new Response(await readFile(contentPath(params.path)), {
			headers: { 'content-type': type }
		});
	} catch {
		error(404, 'Not found');
	}
};
