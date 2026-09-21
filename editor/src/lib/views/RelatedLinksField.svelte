<script lang="ts">
	import type { LinkTarget } from '#lib/controllers/pages.controller.ts';
	import type { PageEditor } from '#lib/controllers/page-editor.svelte.ts';
	import Icon from './Icon.svelte';

	let { editor, targets }: { editor: PageEditor; targets: LinkTarget[] } = $props();

	/** A page cannot sensibly link to itself. */
	const choices = $derived(targets.filter((target) => target.slug !== editor.draft.slug));
</script>

<section class="card flex flex-col gap-3">
	<div class="flex flex-col gap-0.5">
		<h2 class="text-lg font-semibold">Related links</h2>
		<p class="text-[0.8125rem] text-ink-3">
			Optional. Shown as a list near the bottom of the page.
		</p>
	</div>

	{#each editor.draft.links as link (link.key)}
		<div class="flex flex-wrap items-center gap-2">
			{#if link.kind === 'page'}
				<label class="flex min-w-60 grow items-center gap-2">
					<span class="sr-only">Page to link to</span>
					<select bind:value={link.slug} class="field">
						<option value="">Choose a page…</option>
						{#each choices as target (target.slug)}
							<option value={target.slug}>{target.topicTitle} · {target.title}</option>
						{/each}
					</select>
				</label>
			{:else}
				<label class="flex min-w-40 grow basis-60 items-center gap-2">
					<span class="sr-only">Link text</span>
					<input bind:value={link.label} placeholder="Link text" class="field" />
				</label>
				<label class="flex min-w-40 grow basis-60 items-center gap-2">
					<span class="sr-only">Web address</span>
					<input
						type="url"
						bind:value={link.href}
						placeholder="https://www.cropwatch.io"
						class="field font-mono text-sm"
					/>
				</label>
			{/if}

			<button
				type="button"
				aria-label="Remove this link"
				onclick={() => editor.removeLink(link)}
				class="flex size-11 items-center justify-center rounded-md text-[#991b1b] hover:bg-muted"
			>
				<Icon name="trash" class="size-[1.125rem]" />
			</button>
		</div>
	{/each}

	<div class="flex flex-wrap gap-2">
		<button type="button" onclick={() => editor.addLink('page')} class="btn gap-1.5 btn-secondary">
			<Icon name="plus" class="size-4" />
			Link to another page
		</button>
		<button type="button" onclick={() => editor.addLink('url')} class="btn gap-1.5 btn-secondary">
			<Icon name="plus" class="size-4" />
			Link to a web address
		</button>
	</div>
</section>
