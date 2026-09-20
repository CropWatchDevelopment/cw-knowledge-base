<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import { contentUrl } from '#lib/controllers/content-url.ts';
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import Icon from './Icon.svelte';

	type Props = {
		/** Path relative to `static/content/`, or `null` while the picture is still to come. */
		src: string | null;
		alt: string;
		width?: number;
		height?: number;
		class?: ClassValue;
	};

	let { src, alt, width, height, class: className }: Props = $props();

	const locale = getLocale();
</script>

{#if src}
	<img
		src={contentUrl(src)}
		{alt}
		{width}
		{height}
		loading="lazy"
		decoding="async"
		class={['w-full border border-line-soft bg-muted object-cover', className]}
	/>
{:else}
	<!-- Says which picture belongs here, so whoever edits the page knows what to add. -->
	<div
		role="img"
		aria-label={alt}
		class={[
			'flex aspect-[17/11] w-full flex-col items-center justify-center gap-2 border border-line-soft bg-muted p-4 text-center text-ink-3',
			className
		]}
	>
		<Icon name="image" class="size-7" />
		<span class="text-xs font-semibold tracking-wide uppercase">{locale.t.pictureComing}</span>
		<span class="text-xs">{alt}</span>
	</div>
{/if}
