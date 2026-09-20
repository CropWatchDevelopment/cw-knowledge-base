<script lang="ts">
	import type { LinkTarget } from '#lib/controllers/pages.controller.ts';

	let { targets }: { targets: LinkTarget[] } = $props();

	let dialog = $state<HTMLDialogElement>();
	let settle: ((href: string | null) => void) | undefined;

	let kind = $state<'page' | 'url'>('page');
	let slug = $state('');
	let anchor = $state('');
	let url = $state('');
	let existing = $state(false);

	const sections = $derived(targets.find((target) => target.slug === slug)?.sections ?? []);

	/**
	 * Opens the chooser and resolves with the link to use: a web address, `page:<slug>#<section>`,
	 * an empty string to remove the link, or `null` if the writer changed their mind.
	 */
	export function choose(current = ''): Promise<string | null> {
		existing = current !== '';
		kind = current.startsWith('page:') || current === '' ? 'page' : 'url';
		url = kind === 'url' ? current : '';

		const [target = '', section = ''] = current.startsWith('page:')
			? current.slice('page:'.length).split('#')
			: [];
		slug = target || targets[0]?.slug || '';
		anchor = section;

		dialog?.showModal();
		return new Promise((resolve) => (settle = resolve));
	}

	function finish(href: string | null) {
		dialog?.close();
		settle?.(href);
		settle = undefined;
	}
</script>

<dialog
	bind:this={dialog}
	onclose={() => finish(null)}
	class="m-auto w-[min(34rem,92vw)] rounded-lg border border-line bg-surface p-0 text-ink backdrop:bg-night/50"
>
	<div class="flex flex-col gap-4 p-6">
		<h2 class="text-xl font-semibold">Link to</h2>

		<div role="group" class="flex gap-1 rounded-xl border border-line bg-muted p-1">
			{#each [['page', 'A page in the knowledge base'], ['url', 'A web address']] as const as [value, label] (value)}
				<button
					type="button"
					aria-pressed={kind === value}
					onclick={() => (kind = value)}
					class={[
						'h-9 grow rounded-lg text-sm',
						kind === value
							? 'border border-[#98adbf] bg-raised font-semibold shadow-sm'
							: 'border border-transparent font-medium text-ink-2'
					]}
				>
					{label}
				</button>
			{/each}
		</div>

		{#if kind === 'page'}
			<label class="flex flex-col gap-1.5">
				<span class="text-sm font-semibold text-ink-2">Page</span>
				<select bind:value={slug} onchange={() => (anchor = '')} class="field">
					{#each targets as target (target.slug)}
						<option value={target.slug}>{target.topicTitle} · {target.title}</option>
					{/each}
				</select>
			</label>

			{#if sections.length > 0}
				<label class="flex flex-col gap-1.5">
					<span class="text-sm font-semibold text-ink-2">Section (optional)</span>
					<select bind:value={anchor} class="field">
						<option value="">The top of the page</option>
						{#each sections as section (section.id)}
							<option value={section.id}>{section.heading}</option>
						{/each}
					</select>
				</label>
			{/if}
		{:else}
			<label class="flex flex-col gap-1.5">
				<span class="text-sm font-semibold text-ink-2">Web address</span>
				<input
					type="url"
					bind:value={url}
					placeholder="https://www.cropwatch.io"
					class="field font-mono text-sm"
				/>
			</label>
		{/if}

		<div class="flex flex-wrap justify-end gap-2">
			{#if existing}
				<button type="button" onclick={() => finish('')} class="mr-auto btn min-h-11 btn-secondary">
					Remove link
				</button>
			{/if}
			<button type="button" onclick={() => finish(null)} class="btn min-h-11 btn-secondary px-5">
				Cancel
			</button>
			<button
				type="button"
				disabled={kind === 'page' ? !slug : !/^https?:\/\/.+/.test(url.trim())}
				onclick={() =>
					finish(kind === 'page' ? `page:${slug}${anchor ? `#${anchor}` : ''}` : url.trim())}
				class="btn min-h-11 btn-primary px-5 disabled:opacity-60"
			>
				Use this link
			</button>
		</div>
	</div>
</dialog>
