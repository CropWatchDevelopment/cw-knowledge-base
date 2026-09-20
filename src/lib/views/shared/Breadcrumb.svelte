<script lang="ts">
	import { resolve } from '$app/paths';
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import Icon from './Icon.svelte';

	type Props = {
		/** Omit on the search page, which sits directly under the home page. */
		topic?: { id: string; title: string };
		/** The current page. Omit on a topic page, where the topic itself is the current page. */
		current?: string;
	};

	let { topic, current }: Props = $props();

	const locale = getLocale();
</script>

<nav
	aria-label={locale.t.breadcrumb}
	class="flex flex-wrap items-center gap-1.5 text-sm leading-5 text-ink-3"
>
	<a
		href={resolve('/[lang=lang]', { lang: locale.lang })}
		class="text-ink-3 no-underline hover:text-accent-ink hover:underline"
	>
		{locale.t.knowledgeBase}
	</a>

	{#if topic}
		<Icon name="chevron-right" class="size-3.5" />
		{#if current}
			<a
				href={resolve('/[lang=lang]/[topic]', { lang: locale.lang, topic: topic.id })}
				class="text-ink-3 no-underline hover:text-accent-ink hover:underline"
			>
				{topic.title}
			</a>
		{:else}
			<span aria-current="page" class="font-medium text-ink">{topic.title}</span>
		{/if}
	{/if}

	{#if current}
		<Icon name="chevron-right" class="size-3.5" />
		<span aria-current="page" class="font-medium text-ink">{current}</span>
	{/if}
</nav>
