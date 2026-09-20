import { contentUrl } from '#lib/controllers/content-url.ts';
import { loadShell } from '#lib/controllers/shell.controller.ts';
import { ContentRepository } from '#lib/models/content-repository.ts';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ fetch, params }) =>
	loadShell(new ContentRepository(fetch, contentUrl), params.lang);
