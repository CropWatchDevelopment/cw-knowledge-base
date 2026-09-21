<script lang="ts">
	import { untrack } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { isHttpError } from '@sveltejs/kit';
	import { saveTopics } from '#lib/controllers/content.remote.ts';
	import { slugify, uniqueSlug } from '#lib/models/slug.ts';
	import { LOCALE_INFO, type Locale, type TopicIcon } from '#lib/site.ts';
	import Icon from '#lib/views/Icon.svelte';

	type Row = {
		key: string;
		id: string;
		/** A topic already in use keeps its address, so its page links keep working. */
		idLocked: boolean;
		icon: TopicIcon;
		title: string;
		description: string;
		pageCount: number;
	};

	const ICONS: { value: TopicIcon; label: string }[] = [
		{ value: 'hardware', label: 'Sensor' },
		{ value: 'software', label: 'Screen' },
		{ value: 'gateway', label: 'Radio' },
		{ value: 'concepts', label: 'Book' }
	];

	let { data } = $props();

	const lang = $derived(page.params.lang as Locale);

	// Loaded once: the page is saved as a whole, then reloaded.
	let rows = $state<Row[]>(
		untrack(() => data.index.topics).map((topic) => ({
			key: crypto.randomUUID(),
			id: topic.id,
			idLocked: true,
			icon: topic.icon,
			title: topic.title,
			description: topic.description,
			pageCount: topic.pages.length
		}))
	);

	let saving = $state(false);
	let saved = $state(false);
	let failure = $state('');

	function add() {
		rows.push({
			key: crypto.randomUUID(),
			id: '',
			idLocked: false,
			icon: 'concepts',
			title: '',
			description: '',
			pageCount: 0
		});
	}

	function move(index: number, by: -1 | 1) {
		const to = index + by;
		if (to < 0 || to >= rows.length) return;
		[rows[index], rows[to]] = [rows[to], rows[index]];
	}

	async function save() {
		saving = true;
		failure = '';

		// A new topic takes its address from its name.
		const addresses: string[] = [];
		for (const row of rows) {
			if (!row.idLocked) row.id = slugify(row.title);
			row.id = uniqueSlug(row.id, addresses);
			addresses.push(row.id);
		}

		try {
			await saveTopics({
				lang,
				topics: $state.snapshot(rows).map((row) => ({
					id: row.id,
					icon: row.icon,
					title: row.title.trim(),
					description: row.description.trim()
				}))
			});
		} catch (cause) {
			failure = isHttpError(cause)
				? cause.body.message
				: 'The topics could not be saved. Give every topic a name.';
			return;
		} finally {
			saving = false;
		}

		saved = true;
		setTimeout(() => (saved = false), 2500);
		for (const row of rows) row.idLocked = true;
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Topics ({LOCALE_INFO[lang].label}) · Knowledge Base Editor</title>
</svelte:head>

<main class="flex min-w-0 grow flex-col gap-5 p-6 sm:p-8">
	<div class="flex flex-wrap items-end gap-4">
		<div class="flex grow flex-col gap-1">
			<h1 class="text-3xl font-bold tracking-tight">
				Topics and menu order ({LOCALE_INFO[lang].label})
			</h1>
			<p class="text-[0.9375rem] text-ink-3">
				The groups on the home page and in the side menu, in the order shown here. A topic with no
				pages written in this language stays hidden on the website until one is.
			</p>
		</div>
		<button
			type="button"
			onclick={save}
			disabled={saving}
			class="btn min-h-11 gap-2 btn-primary px-5 disabled:opacity-60"
		>
			<Icon name="check" class="size-[1.125rem]" />
			{saving ? 'Saving…' : saved ? 'Saved' : 'Save topics'}
		</button>
	</div>

	{#if failure}
		<p
			role="alert"
			class="flex items-start gap-2 rounded-lg border border-warn-line bg-warn-soft p-4 text-warn-ink"
		>
			<Icon name="warning" class="mt-0.5 size-5" />
			{failure}
		</p>
	{/if}

	{#each rows as row, i (row.key)}
		<section class="card flex flex-col gap-4">
			<div class="flex items-center gap-2">
				<h2 class="grow text-lg font-semibold">
					{row.title || 'New topic'}
					<span class="ml-2 text-sm font-normal text-ink-3">
						{row.pageCount === 1 ? '1 page' : `${row.pageCount} pages`}
					</span>
				</h2>

				<button
					type="button"
					aria-label="Move up"
					disabled={i === 0}
					onclick={() => move(i, -1)}
					class="flex size-10 items-center justify-center rounded-md border border-line-soft bg-raised text-ink-2 hover:bg-muted disabled:opacity-40"
				>
					<Icon name="up" class="size-[1.125rem]" />
				</button>
				<button
					type="button"
					aria-label="Move down"
					disabled={i === rows.length - 1}
					onclick={() => move(i, 1)}
					class="flex size-10 items-center justify-center rounded-md border border-line-soft bg-raised text-ink-2 hover:bg-muted disabled:opacity-40"
				>
					<Icon name="down" class="size-[1.125rem]" />
				</button>
				<button
					type="button"
					aria-label="Delete topic"
					disabled={row.pageCount > 0 || rows.length === 1}
					title={row.pageCount > 0 ? 'Move its pages to another topic first.' : undefined}
					onclick={() => (rows = rows.filter((other) => other !== row))}
					class="flex size-10 items-center justify-center rounded-md border border-line-soft bg-raised text-[#991b1b] hover:bg-muted disabled:opacity-40"
				>
					<Icon name="trash" class="size-[1.125rem]" />
				</button>
			</div>

			<div class="flex flex-wrap gap-4">
				<label class="flex min-w-60 grow flex-col gap-1.5">
					<span class="text-sm font-semibold text-ink-2">Name</span>
					<input bind:value={row.title} class="field" />
				</label>

				<label class="flex w-44 flex-col gap-1.5">
					<span class="text-sm font-semibold text-ink-2">Picture</span>
					<select bind:value={row.icon} class="field">
						{#each ICONS as choice (choice.value)}
							<option value={choice.value}>{choice.label}</option>
						{/each}
					</select>
				</label>

				<label class="flex w-52 flex-col gap-1.5">
					<span class="text-sm font-semibold text-ink-2">Address</span>
					<input
						value={row.id}
						oninput={(event) => (row.id = slugify(event.currentTarget.value))}
						readonly={row.idLocked}
						placeholder={slugify(row.title)}
						class={['field font-mono text-sm', row.idLocked && 'bg-muted text-ink-3']}
					/>
				</label>
			</div>

			<label class="flex flex-col gap-1.5">
				<span class="text-sm font-semibold text-ink-2">Description</span>
				<textarea bind:value={row.description} rows="2" class="field h-auto py-2.5 leading-6"
				></textarea>
				<span class="text-[0.8125rem] text-ink-3">Shown on the topic card on the home page.</span>
			</label>
		</section>
	{/each}

	<button
		type="button"
		onclick={add}
		class="flex min-h-13 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line-strong text-[0.9375rem] font-semibold text-accent-ink hover:bg-muted"
	>
		<Icon name="plus" class="size-[1.125rem]" />
		Add a topic
	</button>
</main>
