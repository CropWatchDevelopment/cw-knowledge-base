<script lang="ts">
	import { resolve } from '$app/paths';
	import type { InlineView } from '#lib/controllers/article.controller.ts';
	import { getLocale } from '#lib/controllers/locale-context.ts';

	/** Runs of text with their bold, italic and links. Shared by the body text and table cells. */
	let { nodes }: { nodes: InlineView[] } = $props();

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
