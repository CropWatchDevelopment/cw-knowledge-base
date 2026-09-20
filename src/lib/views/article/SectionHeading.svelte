<script lang="ts">
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import { LinkCopier } from '#lib/controllers/link-copier.svelte.ts';
	import Icon from '#lib/views/shared/Icon.svelte';

	let { id, heading }: { id: string; heading: string } = $props();

	const locale = getLocale();
	const copier = new LinkCopier();
</script>

<div class="flex items-center gap-2">
	<h2 class="text-2xl leading-8 font-semibold text-pretty">{heading}</h2>

	<!-- A real anchor: it jumps to the section without JavaScript, and also copies the link with it. -->
	<a
		href="#{id}"
		aria-label="{locale.t.copySectionLink}: {heading}"
		onclick={() => copier.copy(`#${id}`)}
		class={[
			'peer flex size-9 shrink-0 items-center justify-center rounded-md hover:bg-accent-soft hover:text-accent-ink',
			copier.copied ? 'bg-accent-soft text-accent-ink' : 'text-line-strong'
		]}
	>
		<Icon name={copier.copied ? 'check' : 'link'} class="size-[1.125rem]" />
	</a>

	<span
		aria-hidden="true"
		class={[
			'pointer-events-none flex h-7 items-center gap-1.5 rounded-md bg-ink-2 px-2.5 text-xs font-medium whitespace-nowrap text-raised transition-opacity peer-hover:opacity-100 peer-focus-visible:opacity-100 max-sm:hidden',
			copier.copied ? 'opacity-100' : 'opacity-0'
		]}
	>
		{copier.copied ? locale.t.linkCopied : locale.t.copySectionLink}
		<span class="font-mono text-line-soft">#{id}</span>
	</span>

	<span role="status" class="sr-only">{copier.copied ? locale.t.linkCopied : ''}</span>
</div>
