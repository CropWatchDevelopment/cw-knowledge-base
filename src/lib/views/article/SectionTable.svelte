<script lang="ts">
	import type { TableView } from '#lib/controllers/article.controller.ts';
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import Icon from '#lib/views/shared/Icon.svelte';
	import InlineText from './InlineText.svelte';

	let { table, id }: { table: TableView; id: string } = $props();

	const locale = getLocale();
	const captionId = $derived(`${id}-table-caption`);
</script>

<!--
	Wider than a phone, so the table scrolls sideways inside its frame instead of widening the page.
	The row labels stay pinned on the left while it scrolls. The frame takes keyboard focus so the
	scroll can be reached without a mouse, and is named after the caption for screen readers.
	A scrollable region has to be focusable (WCAG 2.1.1, axe "scrollable-region-focusable"),
	which is why the tabindex warning below is silenced. `relative` keeps the screen-reader-only
	"Yes"/"No" (absolutely positioned) inside the frame; without it they widen the whole page.
-->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="relative overflow-x-auto rounded-lg border border-line-soft bg-raised focus-visible:outline-2 focus-visible:outline-accent"
	role="region"
	aria-labelledby={table.caption ? captionId : undefined}
	aria-label={table.caption ? undefined : table.columns[0]}
	tabindex="0"
>
	<table
		class="w-full min-w-[38rem] border-collapse text-[0.875rem] leading-5 text-ink-2 [&_a]:font-medium [&_a]:text-accent hover:[&_a]:underline"
	>
		{#if table.caption}
			<caption
				id={captionId}
				class="border-b border-line-soft bg-sunken px-4 py-2.5 text-left text-[0.8125rem] font-semibold text-ink"
			>
				{table.caption}
			</caption>
		{/if}
		<thead>
			<tr class="bg-sunken">
				{#each table.columns as column, c (c)}
					<th
						scope="col"
						class={[
							'border-b border-line-soft px-3 py-2.5 align-bottom font-semibold text-ink',
							// No wrapping in the level headings: Japanese would break mid-word.
							c === 0
								? 'sticky left-0 bg-sunken text-left'
								: 'w-[4.75rem] text-center whitespace-nowrap'
						]}
					>
						{column}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each table.rows as row, r (r)}
				<!-- Every row has a solid colour so the pinned label hides the cells scrolling under it. -->
				<tr class="border-t border-line-soft odd:bg-raised even:bg-surface">
					<th scope="row" class="sticky left-0 bg-inherit px-3 py-2.5 text-left font-normal">
						<InlineText nodes={row.label} />
					</th>
					{#each row.cells as cell, c (c)}
						<td class="px-3 py-2.5 text-center">
							{#if cell === true}
								<Icon name="check" class="mx-auto size-5 text-brand" />
								<span class="sr-only">{locale.t.tableYes}</span>
							{:else if cell === false}
								<span aria-hidden="true" class="mx-auto block h-0.5 w-3 rounded-full bg-line-soft"
								></span>
								<span class="sr-only">{locale.t.tableNo}</span>
							{:else}
								<InlineText nodes={cell} />
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
