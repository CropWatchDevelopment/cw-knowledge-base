export const LOCALES = ['en', 'ja'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE = 'en' satisfies Locale;

export const LOCALE_INFO: Record<Locale, { label: string; short: string }> = {
	en: { label: 'English', short: 'EN' },
	ja: { label: '日本語', short: 'JA' }
};

export function isLocale(value: string): value is Locale {
	return (LOCALES as readonly string[]).includes(value);
}

/** The language a path like `/ja/gateways` is written in, or the default when it names none. */
export function localeFromPath(pathname: string): Locale {
	const [, first = ''] = pathname.split('/');
	return isLocale(first) ? first : DEFAULT_LOCALE;
}

/** Picks the best supported language from an `Accept-Language` header. */
export function preferredLocale(acceptLanguage: string | null): Locale {
	if (!acceptLanguage) return DEFAULT_LOCALE;

	const ranked = acceptLanguage
		.split(',')
		.map((part) => {
			const [tag, ...params] = part.trim().split(';');
			const q = params.find((param) => param.trim().startsWith('q='));
			return { tag: tag.toLowerCase(), weight: q ? Number(q.trim().slice(2)) : 1 };
		})
		.filter((entry) => entry.tag && !Number.isNaN(entry.weight))
		.sort((a, b) => b.weight - a.weight);

	for (const { tag } of ranked) {
		const primary = tag.split('-')[0];
		if (isLocale(primary)) return primary;
	}

	return DEFAULT_LOCALE;
}
