import { describe, expect, it } from 'vitest';
import { isLocalNetworkAddress } from './lan.ts';

describe('isLocalNetworkAddress', () => {
	it.each([
		'127.0.0.1',
		'::1',
		'192.168.1.20',
		'10.5.0.2',
		'172.16.4.1',
		'172.31.255.254',
		'::ffff:192.168.1.20',
		'fd00::1',
		'fe80::1'
	])('allows %s', (address) => {
		expect(isLocalNetworkAddress(address)).toBe(true);
	});

	it.each([
		'8.8.8.8',
		'172.32.0.1',
		'172.15.0.1',
		'2001:4860:4860::8888',
		'',
		'not-an-address',
		'999.1.1.1'
	])('refuses %j', (address) => {
		expect(isLocalNetworkAddress(address)).toBe(false);
	});
});
