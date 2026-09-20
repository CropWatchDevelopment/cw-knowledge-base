<script lang="ts" module>
	export type TocItem = { id: string; label: string; icon?: 'video' };
</script>

<script lang="ts">
	import Icon from '#lib/views/shared/Icon.svelte';

	type Props = {
		items: TocItem[];
		/** The id of the section being read, highlighted in the list. */
		active?: string;
		onnavigate?: () => void;
	};

	let { items, active, onnavigate }: Props = $props();
</script>

<ul class="flex flex-col gap-0.5">
	{#each items as item (item.id)}
		<li>
			<a
				href="#{item.id}"
				aria-current={item.id === active ? 'location' : undefined}
				onclick={onnavigate}
				class={[
					'flex min-h-9 items-center gap-2 rounded-md px-3 py-1.5 text-sm leading-5 no-underline',
					item.id === active
						? 'bg-nav-active font-semibold text-nav-active-ink'
						: 'text-nav-text hover:bg-nav-hover hover:text-ink'
				]}
			>
				{#if item.icon}
					<Icon name={item.icon} class="size-4" />
				{/if}
				{item.label}
			</a>
		</li>
	{/each}
</ul>
