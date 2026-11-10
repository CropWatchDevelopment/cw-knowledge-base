<script lang="ts">
	import type { BlockView } from '#lib/controllers/article.controller.ts';
	import Icon from '#lib/views/shared/Icon.svelte';
	import InlineText from './InlineText.svelte';

	let { blocks }: { blocks: BlockView[] } = $props();
</script>

<div
	class="prose max-w-none text-base leading-[1.625rem] text-ink-2 prose-a:font-medium prose-a:text-accent prose-a:no-underline hover:prose-a:text-accent-hover hover:prose-a:underline prose-strong:text-ink prose-li:my-1 prose-li:marker:text-ink-3"
>
	{#each blocks as block, i (i)}
		{#if block.type === 'paragraph'}
			<p><InlineText nodes={block.content} /></p>
		{:else if block.type === 'list'}
			<svelte:element this={block.ordered ? 'ol' : 'ul'}>
				{#each block.items as item, j (j)}
					<li><InlineText nodes={item} /></li>
				{/each}
			</svelte:element>
		{:else}
			<div
				role="note"
				class="not-prose flex items-start gap-3 rounded-lg border border-info-line bg-info-soft p-4 text-[0.9375rem] leading-6 text-info-ink"
			>
				<Icon name="info" class="mt-0.5 size-5" />
				<p><InlineText nodes={block.content} /></p>
			</div>
		{/if}
	{/each}
</div>
