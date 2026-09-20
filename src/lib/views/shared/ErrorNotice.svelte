<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { Locale } from '#lib/models/locale.ts';
	import { MESSAGES } from '#lib/models/messages.ts';

	/** Takes the language as a prop (not from context) because it is also shown where no layout has loaded. */
	let { lang }: { lang: Locale } = $props();

	const t = $derived(MESSAGES[lang]);
	const missing = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{missing ? t.notFoundTitle : t.errorTitle} · CropWatch {t.knowledgeBase}</title>
</svelte:head>

<main
	class="flex grow flex-col items-center justify-center gap-3 bg-surface px-6 py-20 text-center"
>
	<p class="text-sm font-semibold text-ink-3">{page.status}</p>
	<h1 class="text-3xl leading-tight font-bold tracking-tight">
		{missing ? t.notFoundTitle : t.errorTitle}
	</h1>
	<p class="max-w-md text-lg leading-7 text-ink-3">{missing ? t.notFoundBody : t.errorBody}</p>
	<a href={resolve('/[lang=lang]', { lang })} class="mt-3 btn btn-primary">{t.backHome}</a>
</main>
