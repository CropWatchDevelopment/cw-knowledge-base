import type { PageDocument, SiteIndex } from './content.ts';
import type { Locale } from './locale.ts';

/**
 * Reads one language's knowledge base from the JSON files in `static/content/<lang>/`.
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

	async index(lang: Locale): Promise<SiteIndex> {
		const response = await this.#fetch(this.#contentUrl(`${lang}/index.json`));
		if (!response.ok) throw new Error(`content/${lang}/index.json responded ${response.status}`);
		return response.json();
	}

	/** `null` when that language has no such page. */
	async page(lang: Locale, slug: string): Promise<PageDocument | null> {
		const file = `${lang}/pages/${encodeURIComponent(slug)}.json`;
		const response = await this.#fetch(this.#contentUrl(file));
		if (response.status === 404) return null;
		if (!response.ok) throw new Error(`content/${file} responded ${response.status}`);
		return response.json();
	}
}
