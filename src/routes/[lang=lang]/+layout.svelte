<script lang="ts">
	import { page } from '$app/state';
	import { setLocale } from '#lib/controllers/locale-context.ts';
	import { DEFAULT_LOCALE, LOCALES } from '#lib/models/locale.ts';
	import { MESSAGES } from '#lib/models/messages.ts';
	import SiteFooter from '#lib/views/layout/SiteFooter.svelte';
	import SiteHeader from '#lib/views/layout/SiteHeader.svelte';

	let { data, children } = $props();

	// Getters, so every view follows along when the reader switches language.
	setLocale({
		get lang() {
			return data.lang;
		},
		get t() {
			return MESSAGES[data.lang];
		}
	});

	// The server writes `<html lang>` for the first page (see hooks.server.ts);
	// after that, switching language happens in the browser, so the document is updated here.
	$effect(() => {
		document.documentElement.lang = data.lang;
	});

	/** This page's address in another language, for search engines. */
	const alternate = (lang: string) =>
		page.url.origin + ['', lang, ...page.url.pathname.split('/').slice(2)].join('/');
</script>

<svelte:head>
	{#each LOCALES as lang (lang)}
		<link rel="alternate" hreflang={lang} href={alternate(lang)} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={alternate(DEFAULT_LOCALE)} />
</svelte:head>

<div class="flex min-h-dvh flex-col">
	<SiteHeader nav={data.nav} searchEntries={data.searchEntries} />
	{@render children()}
	<SiteFooter />
</div>
