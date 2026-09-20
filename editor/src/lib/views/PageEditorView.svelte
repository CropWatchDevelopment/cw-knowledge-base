<script lang="ts">
	import { untrack } from 'svelte';
	import { beforeNavigate, goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { LinkTarget } from '#lib/controllers/pages.controller.ts';
	import { PageEditor } from '#lib/controllers/page-editor.svelte.ts';
	import type { PageDraft } from '#lib/models/page-draft.ts';
	import { siteUrl } from '#lib/site-url.ts';
	import { DEFAULT_LOCALE, LOCALE_INFO, youtubeId, type SiteIndex } from '#lib/site.ts';
	import Icon from './Icon.svelte';
	import LinkPicker from './LinkPicker.svelte';
	import LocaleTabs from './LocaleTabs.svelte';
	import RelatedLinksField from './RelatedLinksField.svelte';
	import SectionCard from './SectionCard.svelte';

	type Props = {
		draft: PageDraft;
		index: SiteIndex;
		linkTargets: LinkTarget[];
		/** True until the page has been written to disk for the first time. */
		isNew: boolean;
	};

	let { draft: loaded, index, linkTargets, isNew }: Props = $props();

	// One editor per page: the route keys on the address, so opening another page starts afresh.
	const editor = untrack(() => new PageEditor(loaded, index, isNew));

	let picker = $state<LinkPicker>();
	let justSaved = $state(false);

	const lang = $derived(editor.lang);
	const draft = $derived(editor.draft);
	const videoId = $derived(draft.videoUrl.trim() === '' ? null : youtubeId(draft.videoUrl.trim()));
	const pageUrl = $derived(siteUrl(page.url.hostname, `/${lang}/${draft.topic}/${editor.slug}`));

	beforeNavigate((navigation) => {
		// Leaving the editor itself (tab close, reload) is handled by the browser, below.
		if (!editor.dirty || navigation.willUnload) return;
		if (!confirm('This page has changes that are not saved. Leave anyway?')) navigation.cancel();
	});

	async function save() {
		const wasNew = editor.isNew;
		if (!(await editor.save())) return;

		justSaved = true;
		setTimeout(() => (justSaved = false), 2500);

		if (wasNew) await goto(resolve('/pages/[slug]', { slug: draft.slug }), { invalidateAll: true });
		else await invalidateAll();
	}
</script>

<svelte:window
	onbeforeunload={(event) => {
		if (editor.dirty) event.preventDefault();
	}}
/>

<main class="flex min-w-0 grow flex-col">
	<div
		class="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-line bg-surface px-6 py-3"
	>
		<a
			href={resolve('/')}
			class="flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink-2 no-underline hover:underline"
		>
			<Icon name="back" class="size-[1.125rem]" />
			All pages
		</a>

		<div class="h-7 w-px bg-line-soft"></div>

		<span class="max-w-60 truncate text-lg font-semibold">
			{draft.title[DEFAULT_LOCALE] || 'New page'}
		</span>

		{#if editor.dirty}
			<span class="chip border-warn-line bg-warn-soft text-warn-ink">Not saved yet</span>
		{:else if justSaved}
			<span class="chip border-brand-line bg-brand-soft text-[#166534]">Saved</span>
		{/if}

		<div class="grow"></div>

		<LocaleTabs bind:lang={editor.lang} />

		<a
			href={editor.isNew ? undefined : pageUrl}
			target="_blank"
			rel="noreferrer"
			aria-disabled={editor.isNew}
			class={[
				'btn min-h-11 gap-2 btn-secondary px-4',
				editor.isNew && 'pointer-events-none opacity-60'
			]}
		>
			<Icon name="eye" class="size-[1.125rem]" />
			Preview
		</a>

		<button
			type="button"
			onclick={save}
			disabled={editor.saving}
			class="btn min-h-11 gap-2 btn-primary px-5 disabled:opacity-60"
		>
			<Icon name="check" class="size-[1.125rem]" />
			{editor.saving ? 'Saving…' : 'Save page'}
		</button>
	</div>

	{#if editor.problems.length > 0}
		<div
			role="alert"
			class="mx-6 mt-4 flex gap-3 rounded-lg border border-warn-line bg-warn-soft p-4 text-warn-ink"
		>
			<Icon name="warning" class="mt-0.5 size-5" />
			<div class="flex flex-col gap-1">
				<p class="font-semibold">Before this page can be saved:</p>
				<ul class="list-disc pl-5 text-[0.9375rem] leading-6">
					{#each editor.problems as problem (problem)}
						<li>{problem}</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}

	<div class="flex grow flex-col gap-6 p-6 xl:flex-row xl:items-start">
		<div class="flex min-w-0 grow flex-col gap-4">
			<section class="card flex flex-col gap-4">
				<h2 class="text-lg font-semibold">Title and introduction</h2>

				<label class="flex flex-col gap-1.5">
					<span class="text-sm font-semibold text-ink-2">
						Page title
						{#if lang !== DEFAULT_LOCALE}
							<span class="font-normal text-ink-3">({LOCALE_INFO[lang].label})</span>
						{/if}
					</span>
					<input
						bind:value={draft.title[lang]}
						placeholder={lang === DEFAULT_LOCALE ? '' : draft.title[DEFAULT_LOCALE]}
						class="field text-base"
					/>
				</label>

				<label class="flex flex-col gap-1.5">
					<span class="text-sm font-semibold text-ink-2">Introduction</span>
					<textarea
						bind:value={draft.intro[lang]}
						rows="3"
						placeholder={lang === DEFAULT_LOCALE ? '' : draft.intro[DEFAULT_LOCALE]}
						class="field h-auto py-2.5 leading-6"></textarea>
					<span class="text-[0.8125rem] text-ink-3">One or two sentences under the title.</span>
				</label>
			</section>

			{#each draft.sections as section, i (section.key)}
				<SectionCard
					{editor}
					{section}
					position={i}
					count={draft.sections.length}
					onpickLink={(current) => picker?.choose(current) ?? Promise.resolve(null)}
				/>
			{/each}

			<button
				type="button"
				onclick={editor.addSection}
				class="flex min-h-13 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line-strong text-[0.9375rem] font-semibold text-accent-ink hover:bg-muted"
			>
				<Icon name="plus" class="size-[1.125rem]" />
				Add a section
			</button>

			<RelatedLinksField {editor} targets={linkTargets} />

			<section class="card flex flex-col gap-3">
				<div class="flex flex-col gap-0.5">
					<h2 class="text-lg font-semibold">Demo video</h2>
					<p class="text-[0.8125rem] text-ink-3">
						Optional. Paste a YouTube link and the video appears at the bottom of the page.
					</p>
				</div>

				<div class="flex flex-wrap items-start gap-4">
					<label class="flex min-w-60 grow flex-col gap-1.5">
						<span class="text-sm font-semibold text-ink-2">YouTube link</span>
						<input
							type="url"
							bind:value={draft.videoUrl}
							placeholder="https://www.youtube.com/watch?v=…"
							class="field font-mono text-sm"
						/>
						{#if videoId}
							<span class="flex items-center gap-1.5 text-[0.8125rem] font-medium text-[#166534]">
								<Icon name="check" class="size-4" />
								Video found. This is how it will look.
							</span>
						{:else if draft.videoUrl.trim() !== ''}
							<span class="flex items-center gap-1.5 text-[0.8125rem] font-medium text-warn-ink">
								<Icon name="warning" class="size-4" />
								That is not a YouTube link.
							</span>
						{/if}
					</label>

					{#if videoId}
						<img
							src="https://i.ytimg.com/vi/{videoId}/mqdefault.jpg"
							alt=""
							class="h-32 w-56 rounded-md border border-line-strong bg-night object-cover"
						/>
					{/if}
				</div>
			</section>
		</div>

		<aside class="flex w-full shrink-0 flex-col gap-4 xl:w-85">
			<section class="card flex flex-col gap-4">
				<h2 class="text-lg font-semibold">Page settings</h2>

				<label class="flex flex-col gap-1.5">
					<span class="text-sm font-semibold text-ink-2">Topic</span>
					<select bind:value={draft.topic} class="field">
						{#each index.topics as topic (topic.id)}
							<option value={topic.id}>{topic.title[DEFAULT_LOCALE]}</option>
						{/each}
					</select>
				</label>

				<label class="flex flex-col gap-1.5">
					<span class="text-sm font-semibold text-ink-2">Page address</span>
					<input
						value={editor.slug}
						oninput={(event) => editor.setSlug(event.currentTarget.value)}
						readonly={editor.slugLocked}
						class={['field font-mono text-sm', editor.slugLocked && 'bg-muted text-ink-3']}
					/>
					<span class="font-mono text-xs break-all text-ink-3">
						/{lang}/{draft.topic}/{editor.slug || '…'}
					</span>
					{#if editor.slugLocked}
						<span class="text-[0.8125rem] text-ink-3">
							{editor.isNew
								? 'Fixed now that the page has a picture.'
								: 'Kept as it is, so links people already have keep working.'}
						</span>
					{/if}
				</label>

				<label class="flex flex-col gap-1.5">
					<span class="text-sm font-semibold text-ink-2">
						One-line summary
						{#if lang !== DEFAULT_LOCALE}
							<span class="font-normal text-ink-3">({LOCALE_INFO[lang].label})</span>
						{/if}
					</span>
					<textarea
						bind:value={draft.summary[lang]}
						rows="2"
						placeholder={lang === DEFAULT_LOCALE ? '' : draft.summary[DEFAULT_LOCALE]}
						class="field h-auto py-2.5 leading-6"></textarea>
					<span class="text-[0.8125rem] text-ink-3">Shown on cards and in search results.</span>
				</label>

				<label class="flex flex-col gap-1.5">
					<span class="text-sm font-semibold text-ink-2">Words people might search for</span>
					<input
						bind:value={draft.keywords[lang]}
						placeholder="antenna, ethernet, setup"
						class="field"
					/>
					<span class="text-[0.8125rem] text-ink-3">Separated by commas. Never shown.</span>
				</label>
			</section>

			<section class="card flex flex-col gap-3">
				<h2 class="text-lg font-semibold">Show on the home page</h2>

				<label class="flex items-start gap-3">
					<input
						type="checkbox"
						bind:checked={draft.featured}
						class="mt-0.5 size-5 rounded border-line text-accent focus:ring-accent"
					/>
					<span class="flex flex-col">
						<span class="text-[0.9375rem] font-medium">Under “Start here”</span>
						<span class="text-[0.8125rem] text-ink-3">A large card with the picture.</span>
					</span>
				</label>

				<label class="flex items-start gap-3">
					<input
						type="checkbox"
						bind:checked={draft.popular}
						class="mt-0.5 size-5 rounded border-line text-accent focus:ring-accent"
					/>
					<span class="flex flex-col">
						<span class="text-[0.9375rem] font-medium">Next to “Popular”</span>
						<span class="text-[0.8125rem] text-ink-3">A small button under the search box.</span>
					</span>
				</label>
			</section>

			<section class="card flex flex-col gap-2">
				<h2 class="text-lg font-semibold">Where this is saved</h2>
				<p class="text-[0.8125rem] leading-5 text-ink-3">
					Save page writes this file on this computer. Publish to website sends it live.
				</p>
				<span
					class="rounded-md border border-line-soft bg-muted px-2.5 py-2 font-mono text-xs break-all text-ink-2"
				>
					static/content/pages/{editor.slug || '…'}.json
				</span>
			</section>
		</aside>
	</div>
</main>

<LinkPicker bind:this={picker} targets={linkTargets} />
