import { createContext } from 'svelte';
import type { Locale } from '#lib/models/locale.ts';
import type { Messages } from '#lib/models/messages.ts';

/**
 * The reader's language and the site's words in that language, set once by the `[lang]` layout.
 * Read properties off the object (`locale.t.searchButton`) rather than destructuring it,
 * so views update when the language changes.
 */
export const [getLocale, setLocale] = createContext<{
	readonly lang: Locale;
	readonly t: Messages;
}>();
