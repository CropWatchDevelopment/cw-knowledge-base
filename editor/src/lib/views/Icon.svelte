<script lang="ts" module>
	/** 24×24 stroke icons. Each value is the inner markup of the `<svg>`. */
	const ICONS = {
		pages:
			'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
		topics: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
		plus: '<path d="M12 5v14M5 12h14"/>',
		trash:
			'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
		up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
		down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
		back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
		'chevron-down': '<path d="m6 9 6 6 6-6"/>',
		'chevron-right': '<path d="m9 6 6 6-6 6"/>',
		check: '<path d="m5 12 5 5 9-10"/>',
		close: '<path d="M6 6l12 12M18 6 6 18"/>',
		link: '<path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/>',
		unlink:
			'<path d="M17 7l3-3M7 17l-3 3M10 13a5 5 0 0 0 7.07 0M14 11a5 5 0 0 0-7.07 0"/><path d="M4 4l16 16"/>',
		image:
			'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5L5 20"/>',
		video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
		upload: '<path d="M12 16V4M6 10l6-6 6 6M4 20h16"/>',
		eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
		external:
			'<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
		info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
		warning: '<path d="M12 4 2.5 20h19z"/><path d="M12 10v5M12 17.5v.5"/>',
		bullets: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
		numbers: '<path d="M10 6h10M10 12h10M10 18h10M4 5l1.5-1v4M4 15.5c0-2 3-1.5 1.5.5L4 18h3"/>',
		note: '<path d="M7 8h10M7 12h10M7 16h6"/><rect x="3" y="4" width="18" height="16" rx="2"/>',
		drag: '<circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>'
	} as const;

	export type IconName = keyof typeof ICONS;
</script>

<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	let { name, class: className }: { name: IconName; class?: ClassValue } = $props();
</script>

<svg
	viewBox="0 0 24 24"
	fill={name === 'drag' ? 'currentColor' : 'none'}
	stroke={name === 'drag' ? 'none' : 'currentColor'}
	stroke-width="1.75"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	class={['shrink-0', className ?? 'size-5']}
>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- static markup from the map above -->
	{@html ICONS[name]}
</svg>
