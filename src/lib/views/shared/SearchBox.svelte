<script lang="ts">
	import { resolve } from '$app/paths';
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import { SearchBox } from '#lib/controllers/search-box.svelte.ts';
	import type { SearchEntry } from '#lib/models/search.ts';
	import Icon from './Icon.svelte';

	type Props = {
		entries: SearchEntry[];
		/** `hero` is the large field on the home page; `compact` sits in the header. */
		size?: 'hero' | 'compact';
		id: string;
	};

	let { entries, size = 'compact', id }: Props = $props();

	const locale = getLocale();
	const search = new SearchBox(() => entries);
	const hero = $derived(size === 'hero');
</script>

<!--
	A plain GET form, so searching works before (or without) JavaScript.
	With JavaScript, matching guides appear under the field as you type.
-->
<form
	role="search"
	method="GET"
	action={resolve('/[lang=lang]/search', { lang: locale.lang })}
	class="relative w-full"
	onfocusin={() => (search.focused = true)}
	onfocusout={(event) => {
		if (!event.currentTarget.contains(event.relatedTarget as Node | null)) search.close();
	}}
	onsubmit={search.close}
>
	<div
		class={[
			'flex items-center border bg-raised focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent',
			hero
				? 'h-14 gap-3 rounded-xl border-line-strong pr-2 pl-4 shadow-card'
				: 'h-10 gap-2 rounded-xl border-[#98adbf] px-3'
		]}
	>
		<Icon name="search" class={['text-ink-3', hero ? 'size-5' : 'size-4']} />
		<label for={id} class="sr-only">{locale.t.searchLabel}</label>
		<input
			{id}
			type="search"
			name="q"
			autocomplete="off"
			bind:value={search.query}
			onkeydown={(event) => {
				if (event.key === 'Escape') search.close();
			}}
			placeholder={hero ? locale.t.searchPlaceholder : locale.t.searchPlaceholderShort}
			class={[
				'min-w-0 grow border-0 bg-transparent p-0 text-ink placeholder:text-ink-3 focus:ring-0 focus:outline-none',
				hero ? 'text-base' : 'text-sm'
			]}
		/>
		{#if hero}
			<button type="submit" class="btn h-10 rounded-xl btn-primary px-5">
				{locale.t.searchButton}
			</button>
		{/if}
	</div>

	{#if search.open}
		<div
			class="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-line bg-raised text-left shadow-card"
		>
			{#if search.suggestions.length > 0}
				<ul>
					{#each search.suggestions as entry (entry.slug)}
						<li>
							<a
								href={resolve('/[lang=lang]/[topic]/[slug]', {
									lang: locale.lang,
									topic: entry.topic,
									slug: entry.slug
								})}
								onclick={search.close}
								class="flex flex-col gap-0.5 px-4 py-2.5 text-ink no-underline hover:bg-muted focus-visible:bg-muted"
							>
								<span class="text-sm font-semibold">{entry.title}</span>
								<span class="text-xs text-ink-3">{entry.topicTitle}</span>
							</a>
						</li>
					{/each}
				</ul>
				<button
					type="submit"
					class="w-full cursor-pointer border-t border-line-soft bg-sunken px-4 py-2.5 text-left text-sm font-medium text-accent-ink hover:bg-muted"
				>
					{locale.t.searchAll(search.query.trim())}
				</button>
			{:else}
				<p class="px-4 py-3 text-sm text-ink-3">{locale.t.searchEmpty(search.query.trim())}</p>
			{/if}
		</div>
	{/if}
</form>
