<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import type { NavTopic } from '#lib/controllers/shell.controller.ts';

	type Props = {
		nav: NavTopic[];
		/** Called when a link is followed, e.g. to close the drawer this menu sits in. */
		onnavigate?: () => void;
	};

	let { nav, onnavigate }: Props = $props();

	const locale = getLocale();
</script>

<nav aria-label={locale.t.sectionsNav} class="flex flex-col gap-4">
	{#each nav as topic (topic.id)}
		<div class="flex flex-col gap-0.5">
			<a
				href={resolve('/[lang=lang]/[topic]', { lang: locale.lang, topic: topic.id })}
				onclick={onnavigate}
				class="px-2 pt-2 pb-1 text-[0.625rem] font-bold tracking-[0.075em] text-nav-group uppercase no-underline hover:text-accent-ink"
			>
				{topic.title}
			</a>

			{#each topic.pages as item (item.slug)}
				{@const current = page.params.topic === topic.id && page.params.slug === item.slug}
				<a
					href={resolve('/[lang=lang]/[topic]/[slug]', {
						lang: locale.lang,
						topic: topic.id,
						slug: item.slug
					})}
					aria-current={current ? 'page' : undefined}
					onclick={onnavigate}
					class={[
						'flex min-h-9 items-center rounded-md px-3 py-1.5 text-sm leading-5 no-underline',
						current
							? 'bg-nav-active font-semibold text-nav-active-ink'
							: 'text-nav-text hover:bg-nav-hover hover:text-ink'
					]}
				>
					{item.title}
				</a>
			{/each}
		</div>
	{/each}
</nav>
