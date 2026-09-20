<script lang="ts">
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import DocsShell from '#lib/views/layout/DocsShell.svelte';
	import Breadcrumb from '#lib/views/shared/Breadcrumb.svelte';
	import GuideCard from '#lib/views/shared/GuideCard.svelte';
	import Icon from '#lib/views/shared/Icon.svelte';

	let { data } = $props();

	const locale = getLocale();
</script>

<svelte:head>
	<title>{data.topic.title} · CropWatch {locale.t.knowledgeBase}</title>
	<meta name="description" content={data.topic.description} />
</svelte:head>

<DocsShell nav={data.nav}>
	<div class="flex flex-col gap-8">
		<header class="flex flex-col gap-3">
			<Breadcrumb topic={data.topic} />
			<div class="mt-1 flex items-center gap-3">
				<div
					class="flex size-11 shrink-0 items-center justify-center rounded-[0.625rem] border border-brand-line bg-brand-soft text-brand"
				>
					<Icon name={data.topic.icon} class="size-6" />
				</div>
				<h1 class="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
					{data.topic.title}
				</h1>
			</div>
			<p class="text-lg leading-7 text-pretty text-ink-2">{data.topic.description}</p>
		</header>

		{#if data.guides.length > 0}
			<div class="grid gap-5 sm:grid-cols-2">
				{#each data.guides as guide (guide.slug)}
					<GuideCard {guide} showTopic={false} />
				{/each}
			</div>
		{:else}
			<p class="text-ink-3">{locale.t.noGuidesYet}</p>
		{/if}
	</div>
</DocsShell>
