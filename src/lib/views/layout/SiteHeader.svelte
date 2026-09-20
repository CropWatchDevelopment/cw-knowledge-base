<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import logo from '#lib/assets/cropwatch-knowledge-base.svg';
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import type { NavTopic } from '#lib/controllers/shell.controller.ts';
	import type { SearchEntry } from '#lib/models/search.ts';
	import { SITE_LINKS } from '#lib/models/site.ts';
	import Icon from '#lib/views/shared/Icon.svelte';
	import SearchBox from '#lib/views/shared/SearchBox.svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import SideNav from './SideNav.svelte';

	let { nav, searchEntries }: { nav: NavTopic[]; searchEntries: SearchEntry[] } = $props();

	const locale = getLocale();

	let drawer = $state<HTMLDialogElement>();

	// The home page has its own large search field, so the header one would be a duplicate there.
	const isHome = $derived(page.route.id === '/[lang=lang]');
</script>

<header
	class="sticky top-0 z-20 flex h-header shrink-0 items-center gap-2 border-b-2 border-line-soft bg-brand px-2 sm:gap-4 sm:px-6"
>
	<button
		type="button"
		aria-label={locale.t.openMenu}
		onclick={() => drawer?.showModal()}
		class="flex size-11 cursor-pointer items-center justify-center rounded-md text-white hover:bg-white/15 lg:hidden"
	>
		<Icon name="menu" class="size-6" />
	</button>

	<a
		href={resolve('/[lang=lang]', { lang: locale.lang })}
		class="flex items-center gap-3 text-white no-underline"
	>
		<img src={logo} alt="" width="48" height="48" class="size-10 sm:size-12" />
		<span class="flex flex-col">
			<span class="text-base leading-5 font-bold">CropWatch</span>
			<span class="text-xs leading-4 font-medium text-brand-mist">{locale.t.knowledgeBase}</span>
		</span>
	</a>

	<div class="grow"></div>

	{#if !isHome}
		<div class="w-full max-w-[22.5rem] max-md:hidden">
			<SearchBox entries={searchEntries} id="header-search" />
		</div>
		<a
			href={resolve('/[lang=lang]/search', { lang: locale.lang })}
			aria-label={locale.t.searchLabel}
			class="flex size-11 items-center justify-center rounded-md text-white hover:bg-white/15 md:hidden"
		>
			<Icon name="search" class="size-6" />
		</a>
	{/if}

	<a
		href={SITE_LINKS.app}
		target="_blank"
		rel="noopener external"
		class={[
			'items-center gap-1.5 px-3 py-2 text-sm font-medium text-white no-underline hover:underline',
			isHome ? 'flex max-sm:hidden' : 'hidden xl:flex'
		]}
	>
		{locale.t.openApp}
		<Icon name="external" class="size-4" />
	</a>

	<LanguageSwitcher />
</header>

<!-- Phone and tablet menu. <dialog> traps focus and closes on Escape by itself. -->
<dialog
	bind:this={drawer}
	aria-label={locale.t.sectionsNav}
	onclick={(event) => {
		// A click on the dialog element itself is a click on the backdrop.
		if (event.target === drawer) drawer.close();
	}}
	class="m-0 h-dvh max-h-none w-[min(20rem,85vw)] max-w-none overflow-y-auto border-r border-line bg-linear-to-b from-[#f4f8fb] to-[#e7eef5] p-0 backdrop:bg-night/50"
>
	<div class="flex flex-col gap-2 p-2">
		<button
			type="button"
			aria-label={locale.t.closeMenu}
			onclick={() => drawer?.close()}
			class="flex size-11 cursor-pointer items-center justify-center self-end rounded-md text-ink-2 hover:bg-nav-hover"
		>
			<Icon name="close" class="size-6" />
		</button>
		<SideNav {nav} onnavigate={() => drawer?.close()} />
	</div>
</dialog>
