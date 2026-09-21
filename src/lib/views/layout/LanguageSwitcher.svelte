<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import type { Availability } from '#lib/controllers/shell.controller.ts';
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import { LOCALES, LOCALE_INFO, type Locale } from '#lib/models/locale.ts';
	import { MESSAGES } from '#lib/models/messages.ts';
	import Icon from '#lib/views/shared/Icon.svelte';

	let { available }: { available: Record<Locale, Availability> } = $props();

	const locale = getLocale();

	let open = $state(false);

	// Section anchors are the same in every language, so the reader stays on the section they were reading.
	const hash = $derived(browser ? page.url.hash : '');

	/**
	 * Where this reader lands in `lang`. Each language holds its own guides, so the counterpart
	 * of the page being read may simply not have been written; rather than a dead link, that
	 * sends the reader to the home page of the language they asked for.
	 */
	function destination(lang: Locale): { href: string; samePage: boolean } {
		const [, , topic, slug] = page.url.pathname.split('/');
		const home = { href: `/${lang}`, samePage: !topic };

		if (!topic) return home;

		if (!slug) {
			return available[lang].topics.includes(topic)
				? { href: `/${lang}/${topic}`, samePage: true }
				: home;
		}

		const targetTopic = available[lang].pages[slug];
		return targetTopic ? { href: `/${lang}/${targetTopic}/${slug}${hash}`, samePage: true } : home;
	}
</script>

<!-- <details> gives an accessible menu that opens and closes without JavaScript. -->
<details
	bind:open
	class="relative"
	onfocusout={(event) => {
		if (!event.currentTarget.contains(event.relatedTarget as Node | null)) open = false;
	}}
>
	<summary
		aria-label="{locale.t.changeLanguage}: {LOCALE_INFO[locale.lang].label}"
		class="btn h-10 list-none gap-2 btn-secondary pr-3 pl-2 [&::-webkit-details-marker]:hidden"
	>
		<span
			class="flex h-6 w-7 items-center justify-center rounded-md border border-line-soft bg-muted text-[0.6875rem] font-bold text-ink-2"
		>
			{LOCALE_INFO[locale.lang].short}
		</span>
		<span class="max-sm:hidden">{LOCALE_INFO[locale.lang].label}</span>
		<Icon name="chevron-down" class="size-4" />
	</summary>

	<ul
		class="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-lg border border-line bg-raised p-1 shadow-card"
	>
		{#each LOCALES as lang (lang)}
			{@const { href, samePage } = destination(lang)}
			<li>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- built from the current pathname -->
				<a
					{href}
					hreflang={lang}
					{lang}
					aria-current={lang === locale.lang ? 'true' : undefined}
					onclick={() => (open = false)}
					class={[
						'flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm no-underline',
						lang === locale.lang
							? 'bg-nav-active font-semibold text-nav-active-ink'
							: 'text-nav-text hover:bg-nav-hover'
					]}
				>
					<span class="grow">
						{LOCALE_INFO[lang].label}
						{#if !samePage}
							<!-- Written in the language being offered: it describes that side of the site. -->
							<span class="mt-0.5 block text-xs leading-4 font-normal text-ink-3">
								{MESSAGES[lang].notInThisLanguage}
							</span>
						{/if}
					</span>
					{#if lang === locale.lang}
						<Icon name="check" class="size-4" />
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</details>
