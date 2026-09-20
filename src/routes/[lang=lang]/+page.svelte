<script lang="ts">
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import HomeHero from '#lib/views/home/HomeHero.svelte';
	import TopicCard from '#lib/views/home/TopicCard.svelte';
	import GuideCard from '#lib/views/shared/GuideCard.svelte';

	let { data } = $props();

	const locale = getLocale();
</script>

<svelte:head>
	<title>CropWatch {locale.t.knowledgeBase}</title>
	<meta name="description" content={locale.t.heroSubtitle} />
</svelte:head>

<main class="flex grow flex-col">
	<HomeHero searchEntries={data.searchEntries} popular={data.popular} />

	<div class="mx-auto flex w-full max-w-[78rem] flex-col gap-12 px-4 py-10 sm:px-6 sm:py-12">
		<section class="flex flex-col gap-5">
			<h2 class="text-xl leading-7 font-semibold">{locale.t.browseByTopic}</h2>
			<div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
				{#each data.nav as topic (topic.id)}
					<TopicCard {topic} />
				{/each}
			</div>
		</section>

		{#if data.featured.length > 0}
			<section class="flex flex-col gap-5">
				<h2 class="text-xl leading-7 font-semibold">{locale.t.startHere}</h2>
				<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.featured as guide (guide.slug)}
						<GuideCard {guide} />
					{/each}
				</div>
			</section>
		{/if}
	</div>
</main>
