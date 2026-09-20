import { isTranslated, type Locale, type Localized, type PageDocument } from '#lib/site.ts';

export type TranslationStatus = {
	state: 'complete' | 'partial' | 'none';
	/** How many pieces of text (title, introduction, section headings and bodies) are still missing. */
	missing: number;
};

export function translationStatus(page: PageDocument, locale: Locale): TranslationStatus {
	const pieces: Localized<unknown>[] = [
		page.title,
		page.intro,
		...page.sections.flatMap((section) => [section.heading, section.body])
	];
	const missing = pieces.filter((piece) => !isTranslated(piece, locale)).length;

	return {
		state: missing === 0 ? 'complete' : missing === pieces.length ? 'none' : 'partial',
		missing
	};
}
