<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import logo from '../../../src/lib/assets/cropwatch-knowledge-base.svg';
	import { siteUrl } from '#lib/site-url.ts';
	import Icon from '#lib/views/Icon.svelte';
	import PublishButton from '#lib/views/PublishButton.svelte';
	import '../app.css';

	let { data, children } = $props();

	const website = $derived(siteUrl(page.url.hostname));

	const NAV = [
		{ href: resolve('/'), label: 'Pages', icon: 'pages' },
		{ href: resolve('/topics'), label: 'Topics and menu order', icon: 'topics' }
	] as const;
</script>

<div class="flex min-h-dvh flex-col">
	<header
		class="flex h-20 shrink-0 items-center gap-4 border-b-2 border-line-soft bg-brand px-4 sm:px-6"
	>
		<a href={resolve('/')} class="flex items-center gap-3 text-white no-underline">
			<img src={logo} alt="" width="48" height="48" class="size-12" />
			<span class="flex flex-col">
				<span class="text-base leading-5 font-bold">Knowledge Base Editor</span>
				<span class="text-xs leading-4 font-medium text-brand-mist">Running on this computer</span>
			</span>
		</a>

		<div class="grow"></div>

		<a
			href={website}
			target="_blank"
			rel="noreferrer"
			class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white no-underline hover:underline max-sm:hidden"
		>
			View the website
			<Icon name="external" class="size-4" />
		</a>

		<PublishButton status={data.publishStatus} />
	</header>

	<div class="flex grow">
		<nav
			class="w-70 shrink-0 border-r border-line bg-linear-to-b from-[#f4f8fb] to-[#e7eef5] p-2 max-lg:hidden"
		>
			<div
				class="px-2 pt-2 pb-1 text-[0.625rem] font-bold tracking-[0.075em] text-nav-group uppercase"
			>
				Content
			</div>
			{#each NAV as item (item.href)}
				{@const current = page.url.pathname === item.href}
				<a
					href={item.href}
					aria-current={current ? 'page' : undefined}
					class={[
						'flex min-h-11 items-center gap-2.5 rounded-md px-3 text-[0.9375rem] no-underline',
						current
							? 'bg-nav-active font-semibold text-nav-active-ink'
							: 'text-nav-text hover:bg-nav-hover hover:text-ink'
					]}
				>
					<Icon name={item.icon} />
					{item.label}
				</a>
			{/each}

			{#if data.publishStatus.state !== 'ready'}
				<p
					class="m-2 mt-6 rounded-md border border-warn-line bg-warn-soft p-3 text-[0.8125rem] leading-5 text-warn-ink"
				>
					{data.publishStatus.state === 'not-a-repo'
						? 'This project is not in git yet, so the editor cannot publish to the website. Your changes are still saved on this computer.'
						: 'This project has no address to publish to yet. Your changes are still saved on this computer.'}
				</p>
			{/if}
		</nav>

		{@render children()}
	</div>
</div>
