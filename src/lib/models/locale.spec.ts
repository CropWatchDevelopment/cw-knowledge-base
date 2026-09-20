import { describe, expect, it } from 'vitest';
import { isTranslated, localeFromPath, localize, preferredLocale } from './locale.ts';

describe('localize', () => {
	it('returns the requested language when it is written', () => {
		expect(localize({ en: 'Gateway', ja: 'ゲートウェイ' }, 'ja')).toBe('ゲートウェイ');
	});

	it('falls back to the default language when the translation is missing or blank', () => {
		expect(localize({ en: 'Gateway' }, 'ja')).toBe('Gateway');
		expect(localize({ en: 'Gateway', ja: '  ' }, 'ja')).toBe('Gateway');
		expect(localize({ en: ['a'], ja: [] }, 'ja')).toEqual(['a']);
	});
});

describe('isTranslated', () => {
	it('treats blank strings and empty lists as untranslated', () => {
		expect(isTranslated({ en: 'x', ja: 'y' }, 'ja')).toBe(true);
		expect(isTranslated({ en: 'x', ja: '' }, 'ja')).toBe(false);
		expect(isTranslated({ en: 'x' }, 'ja')).toBe(false);
	});
});

describe('localeFromPath', () => {
	it('reads the first segment and ignores anything that is not a language', () => {
		expect(localeFromPath('/ja/gateways/installing-a-gateway')).toBe('ja');
		expect(localeFromPath('/japan')).toBe('en');
		expect(localeFromPath('/')).toBe('en');
	});
});

describe('preferredLocale', () => {
	it('picks the highest-weighted supported language', () => {
		expect(preferredLocale('ja-JP,ja;q=0.9,en;q=0.8')).toBe('ja');
		expect(preferredLocale('fr-FR,fr;q=0.9,ja;q=0.5,en;q=0.7')).toBe('en');
	});

	it('falls back to the default language', () => {
		expect(preferredLocale(null)).toBe('en');
		expect(preferredLocale('de-DE,de;q=0.9')).toBe('en');
	});
});
