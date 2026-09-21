<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { deletePage, movePage, startTranslation } from '#lib/controllers/content.remote.ts';
	import type { PageRow, UntranslatedRow } from '#lib/controllers/pages.controller.ts';
	import { LOCALE_INFO, type Locale } from '#lib/site.ts';
	import Icon from '#lib/views/Icon.svelte';

	let { data } = $props();

	const lang = $derived(page.params.lang as Locale);
	let starting = $state<string>();

	let filter = $state('');
	let confirming = $state<PageRow>();
	let dialog = $state<HTMLDialogElement>();

	const groups = $derived.by(() => {
		const wanted = filter.trim().toLowerCase();
		if (!wanted) return data.groups;

		return data.groups
			.map((group) => ({
				...group,
				pages: group.pages.filter((row) => row.title.toLowerCase().includes(wanted))
			}))
			.filter((group) => group.pages.length > 0);
	});

	const total = $derived(data.groups.reduce((count, group) => count + group.pages.length, 0));

	async function move(row: PageRow, direction: 'up' | 'down') {
		await movePage({ lang, slug: row.slug, direction });
		await invalidateAll();
	}

	async function remove() {
		if (!confirming) return;
		await deletePage({ lang, slug: confirming.slug });
		dialog?.close();
		confirming = undefined;
		await invalidateAll();
	}

	/** Copies the structure across and opens the new, empty page ready to be written. */
	async function translate(row: UntranslatedRow) {
		starting = row.slug;
		try {
			await startTranslation({ lang, from: row.from, slug: row.slug });
			await goto(resolve('/[lang=lang]/pages/[slug]', { lang, slug: row.slug }));
		} finally {
			starting = undefined;
		}
	}
</script>

<svelte:head>
	<title>Pages ({LOCALE_INFO[lang].label}) · Knowledge Base Editor</title>
</svelte:head>

<main class="flex min-w-0 grow flex-col gap-5 p-6 sm:p-8">
	<div class="flex flex-wrap items-end gap-4">
		<div class="flex grow flex-col gap-1">
			<h1 class="text-3xl font-bold tracking-tight">
				Pages in {LOCALE_INFO[lang].label}
			</h1>
			<p class="text-[0.9375rem] text-ink-3">
				Each language has its own pages. What you write here appears only on the
				{LOCALE_INFO[lang].label} side of the website.
			</p>
		</div>
		<a
			href={resolve('/[lang=lang]/pages/new', { lang })}
			class="btn min-h-11 gap-2 btn-primary px-5"
		>
			<Icon name="plus" class="size-[1.125rem]" />
			New page
		</a>
	</div>

	{#if total > 6}
		<div class="flex items-center gap-2">
			<label for="filter" class="sr-only">Find a page by title</label>
			<input
				id="filter"
				type="search"
				bind:value={filter}
				placeholder="Find a page by title"
				class="field max-w-90"
			/>
		</div>
	{/if}

	{#each groups as group (group.id)}
		<section class="flex flex-col gap-2">
			<div class="flex items-center gap-3">
				<h2 class="text-[0.625rem] font-bold tracking-[0.075em] text-nav-group uppercase">
					{group.title}
				</h2>
				<div class="h-px grow bg-line-soft"></div>
				<a
					href={resolve('/[lang=lang]/pages/new', { lang }) + `?topic=${group.id}`}
					class="flex items-center gap-1 text-sm font-medium text-accent-ink no-underline hover:underline"
				>
					<Icon name="plus" class="size-4" />
					New page here
				</a>
			</div>

			<ul class="overflow-hidden rounded-lg border border-line bg-raised">
				{#each group.pages as row, i (row.slug)}
					<li
						class={[
							'flex flex-wrap items-center gap-3 px-4 py-3',
							i > 0 && 'border-t border-line-soft'
						]}
					>
						<a
							href={resolve('/[lang=lang]/pages/[slug]', { lang, slug: row.slug })}
							class="flex min-w-60 grow flex-col gap-1 text-ink no-underline"
						>
							<span class="flex items-center gap-2">
								<span class="text-[0.9375rem] font-semibold">{row.title}</span>
								{#if row.hasVideo}
									<Icon name="video" class="size-4 text-info-ink" />
								{/if}
							</span>
							<span class="font-mono text-xs text-ink-3">{row.slug}</span>
						</a>

						<div class="flex items-center gap-1.5">
							{#each row.alsoIn as locale (locale)}
								<a
									href={resolve('/[lang=lang]/pages/[slug]', { lang: locale, slug: row.slug })}
									class="chip border-brand-line bg-brand-soft text-[#166534] no-underline hover:underline"
								>
									Also in {LOCALE_INFO[locale].label}
								</a>
							{/each}
						</div>

						<span class="flex w-28 items-center gap-2 text-sm font-medium">
							<span class={['size-2 rounded-full', row.changed ? 'bg-[#d97706]' : 'bg-[#059669]']}
							></span>
							{row.changed ? 'Changed' : 'On website'}
						</span>

						<div class="flex items-center gap-1">
							<button
								type="button"
								aria-label="Move {row.title} up"
								disabled={i === 0}
								onclick={() => move(row, 'up')}
								class="flex size-9 items-center justify-center rounded-md border border-line-soft bg-raised text-ink-2 hover:bg-muted disabled:opacity-40"
							>
								<Icon name="up" class="size-4" />
							</button>
							<button
								type="button"
								aria-label="Move {row.title} down"
								disabled={i === group.pages.length - 1}
								onclick={() => move(row, 'down')}
								class="flex size-9 items-center justify-center rounded-md border border-line-soft bg-raised text-ink-2 hover:bg-muted disabled:opacity-40"
							>
								<Icon name="down" class="size-4" />
							</button>
							<button
								type="button"
								aria-label="Delete {row.title}"
								onclick={() => {
									confirming = row;
									dialog?.showModal();
								}}
								class="flex size-9 items-center justify-center rounded-md border border-line-soft bg-raised text-[#991b1b] hover:bg-muted"
							>
								<Icon name="trash" class="size-4" />
							</button>
							<a
								href={resolve('/[lang=lang]/pages/[slug]', { lang, slug: row.slug })}
								class="ml-1 btn min-h-9 btn-secondary">Edit</a
							>
						</div>
					</li>
				{/each}
			</ul>
		</section>
	{:else}
		<p class="text-ink-3">No pages match “{filter}”.</p>
	{/each}

	{#if data.untranslated.length > 0}
		<section class="flex flex-col gap-2">
			<div class="flex items-center gap-3">
				<h2 class="text-[0.625rem] font-bold tracking-[0.075em] text-nav-group uppercase">
					Written in another language, not yet in {LOCALE_INFO[lang].label}
				</h2>
				<div class="h-px grow bg-line-soft"></div>
			</div>
			<p class="text-[0.9375rem] leading-6 text-ink-3">
				Starting one of these copies its sections, pictures and links across, and leaves the words
				for you to write. Until then it does not appear on the
				{LOCALE_INFO[lang].label} side of the website at all.
			</p>

			<ul class="overflow-hidden rounded-lg border border-line bg-raised">
				{#each data.untranslated as row, i (row.slug)}
					<li
						class={[
							'flex flex-wrap items-center gap-3 px-4 py-3',
							i > 0 && 'border-t border-line-soft'
						]}
					>
						<span class="flex min-w-60 grow flex-col gap-1">
							<span class="text-[0.9375rem] font-semibold">{row.title}</span>
							<span class="font-mono text-xs text-ink-3">{row.topicTitle} · {row.slug}</span>
						</span>
						<button
							type="button"
							disabled={starting === row.slug}
							onclick={() => translate(row)}
							class="btn min-h-9 gap-2 btn-secondary"
						>
							<Icon name="plus" class="size-4" />
							{starting === row.slug ? 'Starting…' : `Start it in ${LOCALE_INFO[lang].label}`}
						</button>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</main>

<dialog
	bind:this={dialog}
	onclose={() => (confirming = undefined)}
	class="m-auto w-[min(30rem,92vw)] rounded-lg border border-line bg-surface p-0 text-ink backdrop:bg-night/50"
>
	<div class="flex flex-col gap-4 p-6">
		<h2 class="text-xl font-semibold">
			Delete “{confirming?.title}” from {LOCALE_INFO[lang].label}?
		</h2>
		<p class="text-[0.9375rem] leading-6 text-ink-3">
			The {LOCALE_INFO[lang].label} page is removed from this computer, and links to it from other
			{LOCALE_INFO[lang].label} pages stop working.
			{#if confirming?.alsoIn.length}
				The {confirming.alsoIn.map((locale) => LOCALE_INFO[locale].label).join(' and ')} version is kept,
				and so are the pictures.
			{:else}
				Its pictures go too, because no other language is using them.
			{/if}
			The website keeps the page until you publish.
		</p>
		<div class="flex justify-end gap-2">
			<button type="button" onclick={() => dialog?.close()} class="btn min-h-11 btn-secondary px-5">
				Keep the page
			</button>
			<button
				type="button"
				onclick={remove}
				class="btn min-h-11 border-[#8f1919] bg-linear-to-b from-[#c12727] to-[#a61b1b] px-5 text-white"
			>
				Delete
			</button>
		</div>
	</div>
</dialog>
