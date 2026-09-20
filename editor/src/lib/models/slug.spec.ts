import { describe, expect, it } from 'vitest';
import { slugify, uniqueSlug } from './slug.ts';

describe('slugify', () => {
	it.each([
		['Installing a Gateway!', 'installing-a-gateway'],
		['  VPD / DLI  ', 'vpd-dli'],
		['Café münster', 'cafe-munster'],
		['ゲートウェイの設置', '']
	])('turns %j into %j', (text, expected) => {
		expect(slugify(text)).toBe(expected);
	});
});

describe('uniqueSlug', () => {
	it('keeps a free address and numbers a taken one', () => {
		expect(uniqueSlug('connect', [])).toBe('connect');
		expect(uniqueSlug('connect', ['connect'])).toBe('connect-2');
		expect(uniqueSlug('connect', ['connect', 'connect-2', 'connect-3'])).toBe('connect-4');
	});
});
