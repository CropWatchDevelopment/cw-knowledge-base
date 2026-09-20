<script lang="ts" module>
	/** 24×24 stroke icons. Each value is the inner markup of the `<svg>`. */
	const ICONS = {
		search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
		'chevron-down': '<path d="m6 9 6 6 6-6"/>',
		'chevron-right': '<path d="m9 6 6 6-6 6"/>',
		external:
			'<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
		link: '<path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/>',
		check: '<path d="m5 12 5 5 9-10"/>',
		menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
		close: '<path d="M6 6l12 12M18 6 6 18"/>',
		video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
		image:
			'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5L5 20"/>',
		info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
		hardware:
			'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
		software: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
		gateway:
			'<path d="M12 12v9"/><circle cx="12" cy="10" r="2"/><path d="M7.8 14.2a6 6 0 0 1 0-8.4M16.2 5.8a6 6 0 0 1 0 8.4M4.9 17.1a10 10 0 0 1 0-14.2M19.1 2.9a10 10 0 0 1 0 14.2"/>',
		concepts:
			'<path d="M12 6v14"/><path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3z"/><path d="M21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z"/>'
	} as const;

	export type IconName = keyof typeof ICONS;
</script>

<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	let { name, class: className }: { name: IconName; class?: ClassValue } = $props();
</script>

<svg
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.75"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	class={['shrink-0', className ?? 'size-5']}
>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- static markup from the map above -->
	{@html ICONS[name]}
</svg>
