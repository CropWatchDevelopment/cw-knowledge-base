<script lang="ts">
	import { resolve } from '$app/paths';
	import type { BlockView, InlineView } from '#lib/controllers/article.controller.ts';
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import Icon from '#lib/views/shared/Icon.svelte';

	let { blocks }: { blocks: BlockView[] } = $props();

	const locale = getLocale();
</script>

{#snippet text(node: InlineView)}
	{#if node.bold && node.italic}
		<strong><em>{node.text}</em></strong>
	{:else if node.bold}
		<strong>{node.text}</strong>
	{:else if node.italic}
		<em>{node.text}</em>
	{:else}
		{node.text}
	{/if}
{/snippet}

{#snippet inline(nodes: InlineView[])}
	{#each nodes as node, i (i)}
		{#if node.link?.kind === 'page'}
			{@const params = { lang: locale.lang, topic: node.link.topic, slug: node.link.slug }}
			<a
				href={node.link.hash
					? resolve(`/[lang=lang]/[topic]/[slug]#${node.link.hash}`, params)
					: resolve('/[lang=lang]/[topic]/[slug]', params)}>{@render text(node)}</a
			>
		{:else if node.link}
			<a href={node.link.href} target="_blank" rel="noopener external">{@render text(node)}</a>
		{:else}
			{@render text(node)}
		{/if}
	{/each}
{/snippet}

<div
	class="prose max-w-none text-base leading-[1.625rem] text-ink-2 prose-a:font-medium prose-a:text-accent prose-a:no-underline hover:prose-a:text-accent-hover hover:prose-a:underline prose-strong:text-ink prose-li:my-1 prose-li:marker:text-ink-3"
>
	{#each blocks as block, i (i)}
		{#if block.type === 'paragraph'}
			<p>{@render inline(block.content)}</p>
		{:else if block.type === 'list'}
			<svelte:element this={block.ordered ? 'ol' : 'ul'}>
				{#each block.items as item, j (j)}
					<li>{@render inline(item)}</li>
				{/each}
			</svelte:element>
		{:else}
			<div
				role="note"
				class="not-prose flex items-start gap-3 rounded-lg border border-info-line bg-info-soft p-4 text-[0.9375rem] leading-6 text-info-ink"
			>
				<Icon name="info" class="mt-0.5 size-5" />
				<p>{@render inline(block.content)}</p>
			</div>
		{/if}
	{/each}
</div>
