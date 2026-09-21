import { describe, expect, it } from 'vitest';
import { localeFromPath, preferredLocale } from './locale.ts';

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
