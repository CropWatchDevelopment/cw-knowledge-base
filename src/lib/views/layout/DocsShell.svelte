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
		<!--
			78rem matches the home page, and is exactly what a section needs once there is room for
			it: a 34rem picture, a 2rem gap and a 42rem column of text. The frame only says how much
			room there is; each page keeps its own text to a readable measure inside it.

			It is a container, so what is inside can lay itself out by the room it actually has. The
			side menus appear and disappear at their own widths, which leaves this column narrower at
			1280px than it is at 820px, and anything measuring the window would get that wrong.
		-->
		<div class="@container mx-auto w-full max-w-[47.5rem] lg:max-w-[78rem]">
			{@render children()}
		</div>
	</main>

	{#if aside}
		<aside
			class="sticky top-header h-[calc(100dvh-var(--spacing-header))] w-70 shrink-0 overflow-y-auto border-l border-line-soft bg-surface px-6 py-8 max-2xl:hidden"
		>
			{@render aside()}
		</aside>
	{/if}
</div>
