<script lang="ts">
	import { page } from '$app/state';
	import type { PageEditor } from '#lib/controllers/page-editor.svelte.ts';
	import type { DraftSection } from '#lib/models/page-draft.ts';
	import { siteUrl } from '#lib/site-url.ts';
	import type { Locale } from '#lib/site.ts';
	import Icon from './Icon.svelte';
	import ImageField from './ImageField.svelte';
	import RichTextEditor from './RichTextEditor.svelte';

	type Props = {
		editor: PageEditor;
		section: DraftSection;
		position: number;
		count: number;
		onpickLink: (current: string) => Promise<string | null>;
	};

	let { editor, section, position, count, onpickLink }: Props = $props();

	const lang = $derived(page.params.lang as Locale);
	const anchor = $derived(editor.anchorOf(section));

	let copied = $state(false);

	async function copyAnchor() {
		const url = siteUrl(
			page.url.hostname,
			`/${lang}/${editor.draft.topic}/${editor.slug}#${anchor}`
		);
		// Copying can be refused (an insecure origin, say); the address is shown on screen either way.
		await navigator.clipboard.writeText(url).catch(() => {});
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<section id="section-{section.key}" class="card flex flex-col gap-4">
	<div class="flex items-center gap-2">
		<h2 class="grow text-lg font-semibold">Section {position + 1}</h2>

		<button
			type="button"
			aria-label="Move section {position + 1} up"
			disabled={position === 0}
			onclick={() => editor.moveSection(section, -1)}
			class="flex size-10 items-center justify-center rounded-md border border-line-soft bg-raised text-ink-2 hover:bg-muted disabled:opacity-40"
		>
			<Icon name="up" class="size-[1.125rem]" />
		</button>
		<button
			type="button"
			aria-label="Move section {position + 1} down"
			disabled={position === count - 1}
			onclick={() => editor.moveSection(section, 1)}
			class="flex size-10 items-center justify-center rounded-md border border-line-soft bg-raised text-ink-2 hover:bg-muted disabled:opacity-40"
		>
			<Icon name="down" class="size-[1.125rem]" />
		</button>
		<button
			type="button"
			aria-label="Delete section {position + 1}"
			disabled={count === 1}
			onclick={() => editor.removeSection(section)}
			class="flex size-10 items-center justify-center rounded-md border border-line-soft bg-raised text-[#991b1b] hover:bg-muted disabled:opacity-40"
		>
			<Icon name="trash" class="size-[1.125rem]" />
		</button>
	</div>

	<label class="flex flex-col gap-1.5">
		<span class="text-sm font-semibold text-ink-2">Heading</span>
		<input bind:value={section.heading} class="field text-base" />
	</label>

	<div class="flex flex-wrap items-center gap-2 text-[0.8125rem] text-ink-3">
		<span>Link to this section:</span>
		<span
			class="rounded-md border border-line-soft bg-muted px-2 py-0.5 font-mono text-xs text-ink-2"
		>
			#{anchor || '…'}
		</span>
		<button
			type="button"
			disabled={!anchor || !editor.slug}
			onclick={copyAnchor}
			class="flex min-h-8 items-center gap-1 rounded-md px-2 font-medium text-accent-ink hover:bg-muted disabled:opacity-50"
		>
			<Icon name={copied ? 'check' : 'link'} class="size-3.5" />
			{copied ? 'Copied' : 'Copy full link'}
		</button>
		<span>
			{section.anchorLocked
				? 'Kept as it is, so links people already have keep working.'
				: 'Made from the heading. Each language keeps the same one, so a link works in both.'}
		</span>
	</div>

	<div class="flex flex-col gap-6 lg:flex-row lg:items-start">
		<div
			class={[
				'flex flex-col gap-1.5 lg:w-80 lg:shrink-0',
				section.image?.side === 'right' && 'lg:order-2'
			]}
		>
			<ImageField
				image={section.image}
				upload={(file) => editor.addImage(section, file)}
				onremove={() => (section.image = null)}
			/>
		</div>

		<div class="flex min-w-0 grow flex-col gap-1.5">
			<span class="text-sm font-semibold text-ink-2">Text</span>

			{#key section.key}
				<RichTextEditor
					blocks={section.body}
					onchange={(blocks) => (section.body = blocks)}
					label="the text of section {position + 1}"
					{onpickLink}
				/>
			{/key}
		</div>
	</div>
</section>
