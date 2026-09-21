<script lang="ts">
	import { page } from '$app/state';
	import PageEditorView from '#lib/views/PageEditorView.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>New page · Knowledge Base Editor</title>
</svelte:head>

<!-- Keyed on the topic, so "New page here" in another topic starts a fresh draft. -->
{#key `${page.params.lang}/${data.draft.topic}`}
	<PageEditorView draft={data.draft} index={data.index} linkTargets={data.linkTargets} isNew />
{/key}
