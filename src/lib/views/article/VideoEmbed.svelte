<script lang="ts">
	import { getLocale } from '#lib/controllers/locale-context.ts';

	let { id, title }: { id: string; title: string } = $props();

	const locale = getLocale();

	let playing = $state(false);
</script>

<!--
	The YouTube player only loads once the reader asks for it: the page stays fast and
	nothing is sent to YouTube before then. Without JavaScript the link opens the video on YouTube.
-->
{#if playing}
	<iframe
		src="https://www.youtube-nocookie.com/embed/{id}?autoplay=1&rel=0"
		{title}
		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
		allowfullscreen
		{@attach (player) => player.focus()}
		class="aspect-video w-full rounded-lg border border-line-strong bg-night"
	></iframe>
{:else}
	<a
		href="https://www.youtube.com/watch?v={id}"
		rel="external"
		aria-label={locale.t.playVideo(title)}
		onclick={(event) => {
			event.preventDefault();
			playing = true;
		}}
		class="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-line-strong bg-night"
	>
		<img
			src="https://i.ytimg.com/vi/{id}/hqdefault.jpg"
			alt=""
			loading="lazy"
			decoding="async"
			class="absolute inset-0 size-full object-cover opacity-70 transition-opacity group-hover:opacity-85"
		/>
		<span class="absolute top-4 left-5 text-base font-semibold text-raised drop-shadow">
			{title}
		</span>
		<span
			class="relative flex size-[4.75rem] items-center justify-center rounded-full bg-raised pl-1 text-night shadow-lg transition-transform group-hover:scale-105"
		>
			<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="size-8">
				<path d="M8 5v14l11-7z" />
			</svg>
		</span>
	</a>
{/if}

<p class="text-[0.8125rem] leading-5 text-ink-3">{locale.t.videoNote}</p>
