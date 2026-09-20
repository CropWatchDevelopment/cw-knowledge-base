import { LOCALES } from '#lib/models/locale.ts';
import type { EntryGenerator } from './$types';

/** Reached through the search form rather than a link, so the prerenderer has to be told about it. */
export const entries: EntryGenerator = () => LOCALES.map((lang) => ({ lang }));
