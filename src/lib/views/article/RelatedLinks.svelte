<script lang="ts">
	import { resolve } from '$app/paths';
	import type { RelatedLinkView } from '#lib/controllers/article.controller.ts';
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import Icon from '#lib/views/shared/Icon.svelte';

	let { links }: { links: RelatedLinkView[] } = $props();

	const locale = getLocale();

	const card =
		'flex min-h-16 items-center gap-3 rounded-lg border border-line bg-raised px-4 py-3 text-ink no-underline hover:border-line-strong';
</script>

{#snippet body(title: string, note: string, icon: 'chevron-right' | 'external')}
	<span class="flex grow flex-col gap-0.5">
		<span class="text-[0.9375rem] leading-[1.375rem] font-semibold">{title}</span>
		<span class="text-[0.8125rem] leading-[1.125rem] text-ink-3">{note}</span>
	</span>
	<Icon name={icon} class="size-[1.125rem] text-ink-3" />
{/snippet}

<ul class="grid gap-3 sm:grid-cols-2">
	{#each links as link (link.kind === 'page' ? link.slug : link.href)}
		<li>
			{#if link.kind === 'page'}
				<a
					href={resolve('/[lang=lang]/[topic]/[slug]', {
						lang: locale.lang,
						topic: link.topic,
						slug: link.slug
					})}
					class={card}
				>
					{@render body(link.title, link.topicTitle, 'chevron-right')}
				</a>
			{:else}
				<a href={link.href} target="_blank" rel="noopener external" class={card}>
					{@render body(link.label, locale.t.opensInNewTab, 'external')}
				</a>
			{/if}
		</li>
	{/each}
</ul>
