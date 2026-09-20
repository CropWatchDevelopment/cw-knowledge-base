<script lang="ts">
	import type { DraftImage } from '#lib/models/page-draft.ts';
	import { DEFAULT_LOCALE, LOCALE_INFO, type Locale } from '#lib/site.ts';
	import Icon from './Icon.svelte';

	type Props = {
		image: DraftImage | null;
		lang: Locale;
		/** Stores the file and fills in `src`, width and height on the section. */
		upload: (file: File) => Promise<void>;
		onremove: () => void;
	};

	let { image, lang, upload, onremove }: Props = $props();

	let input = $state<HTMLInputElement>();
	let busy = $state(false);
	let failure = $state('');

	async function choose(event: Event & { currentTarget: HTMLInputElement }) {
		const file = event.currentTarget.files?.[0];
		event.currentTarget.value = '';
		if (!file) return;

		busy = true;
		failure = '';

		try {
			await upload(file);
		} catch (cause) {
			failure = (cause as Error).message;
			if (!image?.src) onremove();
		} finally {
			busy = false;
		}
	}
</script>

<div class="flex flex-col gap-2">
	<span class="text-sm font-semibold text-ink-2">Picture</span>

	{#if image?.src}
		<img
			src="/content/{image.src}"
			alt=""
			class="h-44 w-full rounded-md border border-line-soft bg-muted object-cover"
		/>
	{:else}
		<div
			class="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line-strong bg-muted text-center text-ink-3"
		>
			<Icon name="image" class="size-7" />
			<span class="text-[0.8125rem]">{busy ? 'Adding the picture…' : 'No picture yet'}</span>
		</div>
	{/if}

	<input
		bind:this={input}
		type="file"
		accept="image/jpeg,image/png,image/webp,image/gif"
		onchange={choose}
		class="hidden"
	/>

	<div class="flex flex-wrap items-center gap-2">
		<button
			type="button"
			disabled={busy}
			onclick={() => input?.click()}
			class="btn gap-1.5 btn-secondary disabled:opacity-60"
		>
			<Icon name="upload" class="size-4" />
			{image?.src ? 'Replace picture' : 'Add a picture'}
		</button>

		{#if image}
			<button
				type="button"
				onclick={onremove}
				class="min-h-9 rounded-md px-2 text-sm font-medium text-[#991b1b] hover:bg-muted"
			>
				Remove
			</button>
		{/if}
	</div>

	{#if failure}
		<p class="rounded-md border border-warn-line bg-warn-soft p-2.5 text-[0.8125rem] text-warn-ink">
			{failure}
		</p>
	{/if}

	{#if image}
		<label class="flex flex-col gap-1.5">
			<span class="text-sm font-semibold text-ink-2">
				What the picture shows
				{#if lang !== DEFAULT_LOCALE}<span class="font-normal text-ink-3">
						({LOCALE_INFO[lang].label})</span
					>{/if}
			</span>
			<input bind:value={image.alt[lang]} class="field" />
			<span class="text-[0.8125rem] text-ink-3">
				Read aloud to people who cannot see the picture. Not shown on the page.
			</span>
		</label>

		<label class="flex flex-col gap-1.5">
			<span class="text-sm font-semibold text-ink-2">Caption under the picture (optional)</span>
			<input bind:value={image.caption[lang]} class="field" />
		</label>

		<div class="flex items-center gap-3">
			<span id="side-label" class="text-sm font-semibold text-ink-2">On wide screens, show it</span>
			<div
				role="group"
				aria-labelledby="side-label"
				class="flex h-10 items-center gap-1 rounded-xl border border-line bg-muted p-1"
			>
				{#each ['left', 'right'] as const as side (side)}
					<button
						type="button"
						aria-pressed={image.side === side}
						onclick={() => image && (image.side = side)}
						class={[
							'h-full rounded-lg px-4 text-sm',
							image.side === side
								? 'border border-[#98adbf] bg-raised font-semibold shadow-sm'
								: 'border border-transparent font-medium text-ink-2'
						]}
					>
						{side === 'left' ? 'Left of the text' : 'Right of the text'}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
