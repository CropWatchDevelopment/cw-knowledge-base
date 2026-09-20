<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { publishContent } from '#lib/controllers/content.remote.ts';
	import type { PublishStatus } from '#lib/server/git.ts';
	import Icon from './Icon.svelte';

	let { status }: { status: PublishStatus } = $props();

	let dialog = $state<HTMLDialogElement>();
	let message = $state('');
	let busy = $state(false);
	let failure = $state('');

	const count = $derived(status.changed.length);

	function open() {
		const [first] = status.changed;
		message =
			count === 1
				? `Update ${first.replace(/^pages\//, '').replace(/\.json$/, '')}`
				: `Update ${count} knowledge base pages`;
		failure = '';
		dialog?.showModal();
	}

	async function send() {
		busy = true;
		failure = '';

		const result = await publishContent(message).catch((cause: Error) => ({
			error: cause.message
		}));

		busy = false;
		if (result?.error) {
			failure = result.error;
			return;
		}

		dialog?.close();
		await invalidateAll();
	}
</script>

<button
	type="button"
	onclick={open}
	disabled={count === 0 || status.state !== 'ready'}
	title={status.state === 'not-a-repo'
		? 'This project is not in git yet, so there is nothing to publish to.'
		: status.state === 'no-remote'
			? 'This project has no address to publish to yet.'
			: undefined}
	class="btn min-h-11 gap-2 btn-secondary px-5 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
>
	<Icon name="upload" class="size-[1.125rem]" />
	Publish to website
	{#if count > 0}
		<span
			class="flex h-5.5 min-w-5.5 items-center justify-center rounded-full bg-[#b45309] px-1.5 text-xs font-bold text-white"
		>
			{count}
		</span>
	{/if}
</button>

<dialog
	bind:this={dialog}
	class="m-auto w-[min(34rem,92vw)] rounded-lg border border-line bg-surface p-0 text-ink backdrop:bg-night/50"
>
	<form
		method="dialog"
		class="flex flex-col gap-4 p-6"
		onsubmit={(event) => event.preventDefault()}
	>
		<h2 class="text-xl font-semibold">Publish to the website</h2>

		<p class="text-[0.9375rem] leading-6 text-ink-3">
			{count === 1 ? 'One page has changed' : `${count} pages have changed`}. Publishing sends the
			changes to the website, which updates in a minute or two.
		</p>

		<ul class="max-h-40 overflow-y-auto rounded-md border border-line-soft bg-raised p-3 text-sm">
			{#each status.changed as file (file)}
				<li class="py-0.5 font-mono text-[0.8125rem] text-ink-2">{file}</li>
			{/each}
		</ul>

		<label class="flex flex-col gap-1.5">
			<span class="text-sm font-semibold text-ink-2">What changed?</span>
			<input bind:value={message} class="field" />
		</label>

		{#if failure}
			<p
				class="rounded-md border border-warn-line bg-warn-soft p-3 font-mono text-[0.8125rem] whitespace-pre-wrap text-warn-ink"
			>
				{failure}
			</p>
		{/if}

		<div class="flex justify-end gap-2">
			<button type="button" onclick={() => dialog?.close()} class="btn min-h-11 btn-secondary px-5">
				Cancel
			</button>
			<button
				type="button"
				onclick={send}
				disabled={busy || message.trim() === ''}
				class="btn min-h-11 btn-primary px-5 disabled:opacity-60"
			>
				{busy ? 'Publishing…' : 'Publish'}
			</button>
		</div>
	</form>
</dialog>
