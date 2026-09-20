import type { PageDocument, SiteIndex } from './content.ts';

/**
 * Reads the knowledge base from the JSON files in `static/content/`.
 *
 * `fetch` and `contentUrl` are passed in (SvelteKit's `fetch`, and a function giving the URL of a
 * file under `static/content/`) so the same code serves prerendering and the browser,
 * and so tests can supply their own.
 */
export class ContentRepository {
	#fetch: typeof fetch;
	#contentUrl: (file: string) => string;

	constructor(fetcher: typeof fetch, contentUrl: (file: string) => string) {
		this.#fetch = fetcher;
		this.#contentUrl = contentUrl;
	}

	async index(): Promise<SiteIndex> {
		const response = await this.#fetch(this.#contentUrl('index.json'));
		if (!response.ok) throw new Error(`content/index.json responded ${response.status}`);
		return response.json();
	}

	/** `null` when there is no such page. */
	async page(slug: string): Promise<PageDocument | null> {
		const response = await this.#fetch(this.#contentUrl(`pages/${encodeURIComponent(slug)}.json`));
		if (response.status === 404) return null;
		if (!response.ok) throw new Error(`content/pages/${slug}.json responded ${response.status}`);
		return response.json();
	}
}
