import { searchEntries, type SearchEntry } from '#lib/models/search.ts';

const MAX_SUGGESTIONS = 6;

/** State behind a search field: the full `results`, and a short list of `suggestions` to show while typing. */
export class SearchBox {
	query = $state('');
	focused = $state(false);

	results: SearchEntry[];
	suggestions: SearchEntry[];
	open = $derived(this.focused && this.query.trim() !== '');

	/** `entries` is a function so results follow the language the reader switches to. */
	constructor(entries: () => SearchEntry[]) {
		this.results = $derived(searchEntries(entries(), this.query));
		this.suggestions = $derived(this.results.slice(0, MAX_SUGGESTIONS));
	}

	close = () => {
		this.focused = false;
	};
}
