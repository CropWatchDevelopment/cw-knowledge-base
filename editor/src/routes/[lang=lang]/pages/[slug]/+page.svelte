<script lang="ts">
	import { page } from '$app/state';
	import PageEditorView from '#lib/views/PageEditorView.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.draft.title || data.draft.slug} · Knowledge Base Editor</title>
</svelte:head>

<!-- Keyed on the page and the language, so switching either starts from the file on disk. -->
{#key `${page.params.lang}/${data.draft.slug}`}
	<PageEditorView
		draft={data.draft}
		index={data.index}
		linkTargets={data.linkTargets}
		isNew={false}
	/>
{/key}
