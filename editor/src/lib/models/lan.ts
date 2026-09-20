/**
 * True for this computer and for addresses on a private network
 * (10.x, 172.16–31.x, 192.168.x, link-local, and the IPv6 equivalents).
 * The editor has no login, so it answers nobody else.
 */
export function isLocalNetworkAddress(address: string): boolean {
	// IPv4 reported through an IPv6 socket, e.g. "::ffff:192.168.1.20"
	const ip = address.toLowerCase().replace(/^::ffff:/, '');

	if (ip === '::1') return true;
	if (ip.includes(':')) return /^f[cd]/.test(ip) || /^fe[89ab]/.test(ip);

	const parts = ip.split('.').map(Number);
	if (
		parts.length !== 4 ||
		parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
	) {
		return false;
	}

	const [a, b] = parts;
	return (
		a === 127 ||
		a === 10 ||
		(a === 172 && b >= 16 && b <= 31) ||
		(a === 192 && b === 168) ||
		(a === 169 && b === 254)
	);
}
