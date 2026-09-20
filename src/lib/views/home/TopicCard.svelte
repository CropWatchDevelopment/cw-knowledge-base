<script lang="ts">
	import { resolve } from '$app/paths';
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import type { NavTopic } from '#lib/controllers/shell.controller.ts';
	import Icon from '#lib/views/shared/Icon.svelte';

	const PREVIEW_COUNT = 3;

	let { topic }: { topic: NavTopic } = $props();

	const locale = getLocale();
</script>

<article class="flex flex-col gap-4 rounded-lg border border-line bg-surface p-6">
	<div
		class="flex size-11 items-center justify-center rounded-[0.625rem] border border-brand-line bg-brand-soft text-brand"
	>
		<Icon name={topic.icon} class="size-6" />
	</div>

	<div class="flex flex-col gap-1.5">
		<h3 class="text-lg leading-6 font-semibold">{topic.title}</h3>
		<p class="text-sm leading-[1.375rem] text-ink-3">{topic.description}</p>
	</div>

	<hr class="border-line-soft" />

	{#if topic.pages.length > 0}
		<ul class="flex flex-col gap-2.5">
			{#each topic.pages.slice(0, PREVIEW_COUNT) as item (item.slug)}
				<li>
					<a
						href={resolve('/[lang=lang]/[topic]/[slug]', {
							lang: locale.lang,
							topic: topic.id,
							slug: item.slug
						})}
						class="text-sm leading-5 text-accent no-underline hover:text-accent-hover hover:underline"
					>
						{item.title}
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-sm text-ink-3">{locale.t.noGuidesYet}</p>
	{/if}

	<a
		href={resolve('/[lang=lang]/[topic]', { lang: locale.lang, topic: topic.id })}
		class="mt-auto flex items-center gap-1 text-sm leading-5 font-semibold text-ink-2 no-underline hover:text-accent-ink"
	>
		{locale.t.allGuidesIn(topic.title)}
		<Icon name="chevron-right" class="size-4" />
	</a>
</article>
