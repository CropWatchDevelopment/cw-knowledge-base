<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { NavTopic } from '#lib/controllers/shell.controller.ts';
	import SideNav from './SideNav.svelte';

	type Props = {
		nav: NavTopic[];
		children: Snippet;
		/** Optional right-hand column, e.g. "On this page". Shown on wide screens only. */
		aside?: Snippet;
	};

	let { nav, children, aside }: Props = $props();
</script>

<div class="flex grow">
	<div
		class="sticky top-header h-[calc(100dvh-var(--spacing-header))] w-70 shrink-0 overflow-y-auto border-r border-line bg-linear-to-b from-[#f4f8fb] to-[#e7eef5] px-2 py-4 max-lg:hidden"
	>
		<SideNav {nav} />
	</div>

	<main class="min-w-0 grow bg-surface px-4 pt-6 pb-16 sm:px-8 sm:pt-8">
		<div class="mx-auto w-full max-w-[47.5rem]">
			{@render children()}
		</div>
	</main>

	{#if aside}
		<aside
			class="sticky top-header h-[calc(100dvh-var(--spacing-header))] w-70 shrink-0 overflow-y-auto border-l border-line-soft bg-surface px-6 py-8 max-xl:hidden"
		>
			{@render aside()}
		</aside>
	{/if}
</div>
