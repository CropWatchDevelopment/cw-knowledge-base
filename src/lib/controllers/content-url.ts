import { asset } from '$app/paths';
import type { AssetPath } from '$app/types';

/**
 * The URL of a file under `static/content/`.
 * Content is data that changes without touching the code, so its paths are not checked against
 * SvelteKit's build-time list of static files the way `asset()` normally does.
 */
export const contentUrl = (file: string) => asset(`content/${file}` as AssetPath);
