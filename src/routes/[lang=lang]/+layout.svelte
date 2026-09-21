<script lang="ts">
	import { page } from '$app/state';
	import { setLocale } from '#lib/controllers/locale-context.ts';
	import { DEFAULT_LOCALE, LOCALES, type Locale } from '#lib/models/locale.ts';
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

	/**
	 * This page's address in another language, for search engines, or `null` when that language
	 * does not have it. Pointing a crawler at a page that is not there is worse than saying nothing.
	 */
	function alternate(lang: Locale): string | null {
		const [, , topic, slug] = page.url.pathname.split('/');
		if (!topic) return `${page.url.origin}/${lang}`;
		if (!slug) {
			return data.available[lang].topics.includes(topic)
				? `${page.url.origin}/${lang}/${topic}`
				: null;
		}
		const targetTopic = data.available[lang].pages[slug];
		return targetTopic ? `${page.url.origin}/${lang}/${targetTopic}/${slug}` : null;
	}
</script>

<svelte:head>
	{#each LOCALES as lang (lang)}
		{@const href = alternate(lang)}
		{#if href}
			<link rel="alternate" hreflang={lang} {href} />
			{#if lang === DEFAULT_LOCALE}
				<link rel="alternate" hreflang="x-default" {href} />
			{/if}
		{/if}
	{/each}
</svelte:head>

<div class="flex min-h-dvh flex-col">
	<SiteHeader nav={data.nav} searchEntries={data.searchEntries} available={data.available} />
	{@render children()}
	<SiteFooter />
</div>
