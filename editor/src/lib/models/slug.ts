/** Lowercase words joined by hyphens: the form used for page addresses and section anchors. */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Anchors the site adds itself at the end of every guide. */
export const RESERVED_ANCHORS = ['related-links', 'video'];

/** "Installing a Gateway!" becomes "installing-a-gateway". Text with no Latin letters or digits gives "". */
export function slugify(text: string): string {
	return text
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** `wanted`, or `wanted-2`, `wanted-3`… until it is not in `taken`. */
export function uniqueSlug(wanted: string, taken: Iterable<string>): string {
	const used = new Set(taken);
	if (!used.has(wanted)) return wanted;

	let n = 2;
	while (used.has(`${wanted}-${n}`)) n += 1;
	return `${wanted}-${n}`;
}
