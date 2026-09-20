<script lang="ts">
	import { resolve } from '$app/paths';
	import type { GuideCard } from '#lib/controllers/guide-card.ts';
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import ContentImage from './ContentImage.svelte';
	import Icon from './Icon.svelte';

	let { guide, showTopic = true }: { guide: GuideCard; showTopic?: boolean } = $props();

	const locale = getLocale();
</script>

<a
	href={resolve('/[lang=lang]/[topic]/[slug]', {
		lang: locale.lang,
		topic: guide.topic,
		slug: guide.slug
	})}
	class="group flex flex-col overflow-hidden rounded-lg border border-line-soft bg-surface text-ink no-underline shadow-card transition-colors hover:border-line-strong"
>
	<ContentImage src={guide.image} alt={guide.title} class="h-44 border-0 border-b" />

	<div class="flex flex-col gap-2 p-5">
		{#if showTopic || guide.hasVideo}
			<div class="flex flex-wrap items-center gap-2">
				{#if showTopic}
					<span class="chip border-neutral-line bg-neutral-soft text-neutral-ink">
						{guide.topicTitle}
					</span>
				{/if}
				{#if guide.hasVideo}
					<span class="chip border-info-line bg-info-soft text-info-ink">
						<Icon name="video" class="size-3.5" />
						{locale.t.videoDemo}
					</span>
				{/if}
			</div>
		{/if}

		<h3 class="text-lg leading-6 font-semibold group-hover:text-accent-ink">{guide.title}</h3>
		<p class="text-sm leading-[1.375rem] text-ink-3">{guide.summary}</p>
	</div>
</a>
