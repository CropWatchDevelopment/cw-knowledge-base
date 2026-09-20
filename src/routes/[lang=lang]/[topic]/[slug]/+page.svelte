<script lang="ts">
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import Article from '#lib/views/article/Article.svelte';

	let { data } = $props();

	const locale = getLocale();
</script>

<svelte:head>
	<title>{data.article.title} · CropWatch {locale.t.knowledgeBase}</title>
	<meta name="description" content={data.article.intro} />
</svelte:head>

<!-- A fresh Article per page, so scroll tracking and "copied" states never carry over between guides. -->
{#key data.article.slug}
	<Article article={data.article} nav={data.nav} />
{/key}
