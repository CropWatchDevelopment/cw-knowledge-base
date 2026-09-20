<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import { SearchBox } from '#lib/controllers/search-box.svelte.ts';
	import DocsShell from '#lib/views/layout/DocsShell.svelte';
	import Breadcrumb from '#lib/views/shared/Breadcrumb.svelte';
	import Icon from '#lib/views/shared/Icon.svelte';

	let { data } = $props();

	const locale = getLocale();
	const search = new SearchBox(() => data.searchEntries);

	// This page is prerendered, so `?q=` is only known in the browser:
	// read it when the page opens and again after each new search.
	afterNavigate(() => {
		search.query = page.url.searchParams.get('q') ?? '';
	});

	const term = $derived(search.query.trim());
</script>

<svelte:head>
	<title>{locale.t.searchTitle} · CropWatch {locale.t.knowledgeBase}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<DocsShell nav={data.nav}>
	<div class="flex flex-col gap-6">
		<header class="flex flex-col gap-3">
			<Breadcrumb current={locale.t.searchTitle} />
			<h1 class="mt-1 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
				{locale.t.searchTitle}
			</h1>
		</header>

		<form role="search" method="GET" class="flex gap-2">
			<div
				class="flex h-12 min-w-0 grow items-center gap-3 rounded-xl border border-line-strong bg-raised px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent"
			>
				<Icon name="search" class="size-5 text-ink-3" />
				<label for="page-search" class="sr-only">{locale.t.searchLabel}</label>
				<input
					id="page-search"
					type="search"
					name="q"
					autocomplete="off"
					bind:value={search.query}
					placeholder={locale.t.searchPlaceholder}
					class="min-w-0 grow border-0 bg-transparent p-0 text-base text-ink placeholder:text-ink-3 focus:ring-0 focus:outline-none"
				/>
			</div>
			<button type="submit" class="btn h-12 btn-primary px-5">{locale.t.searchButton}</button>
		</form>

		<p role="status" class="text-[0.9375rem] text-ink-3">
			{#if !term}
				{locale.t.searchPrompt}
			{:else if search.results.length === 0}
				{locale.t.searchEmpty(term)}
			{:else}
				{locale.t.searchCount(search.results.length, term)}
			{/if}
		</p>

		{#if search.results.length > 0}
			<ul class="flex flex-col gap-3">
				{#each search.results as entry (entry.slug)}
					<li>
						<a
							href={resolve('/[lang=lang]/[topic]/[slug]', {
								lang: locale.lang,
								topic: entry.topic,
								slug: entry.slug
							})}
							class="group flex flex-col gap-1.5 rounded-lg border border-line bg-raised px-5 py-4 text-ink no-underline hover:border-line-strong"
						>
							<span class="flex flex-wrap items-center gap-2">
								<span class="text-lg leading-6 font-semibold group-hover:text-accent-ink">
									{entry.title}
								</span>
								<span class="chip border-neutral-line bg-neutral-soft text-neutral-ink">
									{entry.topicTitle}
								</span>
								{#if entry.hasVideo}
									<span class="chip border-info-line bg-info-soft text-info-ink">
										<Icon name="video" class="size-3.5" />
										{locale.t.videoDemo}
									</span>
								{/if}
							</span>
							<span class="text-sm leading-[1.375rem] text-ink-3">{entry.summary}</span>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</DocsShell>
