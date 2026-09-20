<script lang="ts">
	import { resolve } from '$app/paths';
	import type { GuideCard } from '#lib/controllers/guide-card.ts';
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import type { SearchEntry } from '#lib/models/search.ts';
	import SearchBox from '#lib/views/shared/SearchBox.svelte';

	let { searchEntries, popular }: { searchEntries: SearchEntry[]; popular: GuideCard[] } = $props();

	const locale = getLocale();
</script>

<section
	class="flex flex-col items-center gap-3 border-b border-line-soft bg-surface px-4 py-10 text-center sm:px-6 sm:py-14"
>
	<h1 class="text-3xl leading-tight font-bold tracking-tight text-balance sm:text-[2.5rem]">
		{locale.t.heroTitle}
	</h1>
	<p class="max-w-2xl text-lg leading-7 text-pretty text-ink-3">{locale.t.heroSubtitle}</p>

	<div class="mt-4 w-full max-w-[42.5rem]">
		<SearchBox entries={searchEntries} size="hero" id="home-search" />
	</div>

	{#if popular.length > 0}
		<div class="mt-2 flex flex-wrap items-center justify-center gap-2">
			<span class="text-sm text-ink-3">{locale.t.popular}</span>
			{#each popular as guide (guide.slug)}
				<a
					href={resolve('/[lang=lang]/[topic]/[slug]', {
						lang: locale.lang,
						topic: guide.topic,
						slug: guide.slug
					})}
					class="flex h-8 items-center rounded-full border border-accent-line bg-accent-soft px-3 text-sm font-medium text-accent-ink no-underline hover:border-accent"
				>
					{guide.title}
				</a>
			{/each}
		</div>
	{/if}
</section>
