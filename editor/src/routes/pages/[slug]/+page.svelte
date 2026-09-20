<script lang="ts">
	import PageEditorView from '#lib/views/PageEditorView.svelte';
	import { DEFAULT_LOCALE } from '#lib/site.ts';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.draft.title[DEFAULT_LOCALE]} · Knowledge Base Editor</title>
</svelte:head>

{#key data.draft.slug}
	<PageEditorView
		draft={data.draft}
		index={data.index}
		linkTargets={data.linkTargets}
		isNew={false}
	/>
{/key}
