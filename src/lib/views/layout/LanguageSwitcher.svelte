<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import { LOCALES, LOCALE_INFO, type Locale } from '#lib/models/locale.ts';
	import Icon from '#lib/views/shared/Icon.svelte';

	const locale = getLocale();

	let open = $state(false);

	// Section anchors are the same in every language, so the reader stays on the section they were reading.
	const hash = $derived(browser ? page.url.hash : '');

	/** The page being viewed, in another language: only the first path segment changes. */
	function alternate(lang: Locale): string {
		const [, , ...rest] = page.url.pathname.split('/');
		return ['', lang, ...rest].join('/') + hash;
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
		class="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-lg border border-line bg-raised p-1 shadow-card"
	>
		{#each LOCALES as lang (lang)}
			<li>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- built from the current pathname -->
				<a
					href={alternate(lang)}
					hreflang={lang}
					{lang}
					aria-current={lang === locale.lang ? 'true' : undefined}
					onclick={() => (open = false)}
					class={[
						'flex min-h-10 items-center gap-2 rounded-md px-3 text-sm no-underline',
						lang === locale.lang
							? 'bg-nav-active font-semibold text-nav-active-ink'
							: 'text-nav-text hover:bg-nav-hover'
					]}
				>
					<span class="grow">{LOCALE_INFO[lang].label}</span>
					{#if lang === locale.lang}
						<Icon name="check" class="size-4" />
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</details>
