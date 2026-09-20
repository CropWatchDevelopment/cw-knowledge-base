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
		/**
		 * Lets the reader open the picture full size. Left off inside a card, where the whole
		 * card is already a link and a button cannot sit inside one.
		 */
		expandable?: boolean;
		/** Repeated under the large picture, so it keeps its explanation. */
		caption?: string | null;
	};

	let {
		src,
		alt,
		width,
		height,
		class: className,
		expandable = false,
		caption = null
	}: Props = $props();

	const locale = getLocale();

	let dialog = $state<HTMLDialogElement>();
</script>

{#snippet picture()}
	<img
		src={contentUrl(src ?? '')}
		{alt}
		{width}
		{height}
		loading="lazy"
		decoding="async"
		class={['w-full border border-line-soft bg-muted object-cover', className]}
	/>
{/snippet}

{#if src && expandable}
	<button
		type="button"
		onclick={() => dialog?.showModal()}
		aria-label="{locale.t.expandPicture}: {alt}"
		class="group relative block w-full cursor-zoom-in"
	>
		{@render picture()}

		<!-- Appears on hover and on keyboard focus, so the picture looks openable. -->
		<span
			class="pointer-events-none absolute inset-0 rounded-lg bg-night/0 transition-colors group-hover:bg-night/10 group-focus-visible:bg-night/10"
		></span>
		<span
			class="pointer-events-none absolute top-2 right-2 flex size-9 items-center justify-center rounded-md border border-line-soft bg-raised/95 text-ink-2 opacity-0 shadow-card transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
		>
			<Icon name="expand" />
		</span>
	</button>

	<!--
		A modal dialog, so the browser dims the page, traps focus and closes on Escape by itself.
		A click that lands on the dialog itself is a click on the grey area around the picture.
	-->
	<dialog
		bind:this={dialog}
		aria-label={alt}
		onclick={(event) => {
			if (event.target === dialog) dialog.close();
		}}
		class="m-auto h-full max-h-none w-full max-w-none bg-transparent p-4 backdrop:bg-night/80 open:flex open:items-center open:justify-center"
	>
		<div class="relative flex max-h-full flex-col items-center gap-3">
			<img
				src={contentUrl(src)}
				{alt}
				class="max-h-[80dvh] w-auto max-w-full rounded-lg border border-line-soft bg-raised object-contain"
			/>

			{#if caption}
				<p class="max-w-2xl text-center text-sm leading-6 text-raised">{caption}</p>
			{/if}

			<button
				type="button"
				onclick={() => dialog?.close()}
				aria-label={locale.t.closePicture}
				class="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full border border-line-soft bg-raised text-ink shadow-card hover:bg-muted"
			>
				<Icon name="close" class="size-6" />
			</button>
		</div>
	</dialog>
{:else if src}
	{@render picture()}
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
