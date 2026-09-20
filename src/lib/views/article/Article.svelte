<script lang="ts">
	import type { ArticleData } from '#lib/controllers/article.controller.ts';
	import { LinkCopier } from '#lib/controllers/link-copier.svelte.ts';
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import { ScrollSpy } from '#lib/controllers/scroll-spy.svelte.ts';
	import type { NavTopic } from '#lib/controllers/shell.controller.ts';
	import DocsShell from '#lib/views/layout/DocsShell.svelte';
	import Breadcrumb from '#lib/views/shared/Breadcrumb.svelte';
	import Icon from '#lib/views/shared/Icon.svelte';
	import ArticleSection from './ArticleSection.svelte';
	import OnThisPage, { type TocItem } from './OnThisPage.svelte';
	import RelatedLinks from './RelatedLinks.svelte';
	import SectionHeading from './SectionHeading.svelte';
	import VideoEmbed from './VideoEmbed.svelte';

	let { article, nav }: { article: ArticleData; nav: NavTopic[] } = $props();

	const locale = getLocale();
	const spy = new ScrollSpy();
	const pageLink = new LinkCopier();

	// Fixed anchors for the two closing blocks, alongside the editor-chosen section ids.
	const LINKS_ID = 'related-links';
	const VIDEO_ID = 'video';

	const toc = $derived<TocItem[]>([
		...article.sections.map((section) => ({ id: section.id, label: section.heading })),
		...(article.links.length > 0 ? [{ id: LINKS_ID, label: locale.t.relatedLinks }] : []),
		...(article.video ? [{ id: VIDEO_ID, label: locale.t.watchDemo, icon: 'video' as const }] : [])
	]);

	let tocOpen = $state(false);
</script>

<DocsShell {nav}>
	<article class="flex flex-col gap-10 sm:gap-12">
		<header class="flex flex-col gap-3">
			<Breadcrumb topic={article.topic} current={article.title} />

			{#if !article.translated}
				<p
					class="rounded-lg border border-warn-line bg-warn-soft px-4 py-3 text-[0.9375rem] leading-6 text-warn-ink"
				>
					{locale.t.notTranslated}
				</p>
			{/if}

			<!-- `lang` on untranslated text lets screen readers pronounce it correctly. -->
			<h1
				lang={article.translated ? undefined : 'en'}
				class="mt-1 text-3xl leading-tight font-bold tracking-tight text-pretty sm:text-4xl"
			>
				{article.title}
			</h1>
			<p
				lang={article.translated ? undefined : 'en'}
				class="text-lg leading-7 text-pretty text-ink-2"
			>
				{article.intro}
			</p>
		</header>

		{#if toc.length > 1}
			<details bind:open={tocOpen} class="rounded-lg border border-line bg-raised xl:hidden">
				<summary
					class="flex min-h-13 cursor-pointer list-none items-center gap-2 px-4 text-[0.9375rem] font-semibold text-ink-2 [&::-webkit-details-marker]:hidden"
				>
					<span class="grow">{locale.t.onThisPage}</span>
					<Icon
						name="chevron-down"
						class={['size-[1.125rem] transition-transform', tocOpen && 'rotate-180']}
					/>
				</summary>
				<div class="border-t border-line-soft p-2">
					<OnThisPage items={toc} onnavigate={() => (tocOpen = false)} />
				</div>
			</details>
		{/if}

		{#each article.sections as section (section.id)}
			<ArticleSection {section} track={spy.track} />
		{/each}

		{#if article.links.length > 0}
			<section id={LINKS_ID} {@attach spy.track} class="flex flex-col gap-4">
				<SectionHeading id={LINKS_ID} heading={locale.t.relatedLinks} />
				<RelatedLinks links={article.links} />
			</section>
		{/if}

		{#if article.video}
			<section id={VIDEO_ID} {@attach spy.track} class="flex flex-col gap-4">
				<SectionHeading id={VIDEO_ID} heading={locale.t.watchDemo} />
				<VideoEmbed id={article.video.id} title={article.video.title} />
			</section>
		{/if}
	</article>

	{#snippet aside()}
		<div class="flex flex-col gap-4">
			<nav aria-label={locale.t.onThisPage} class="flex flex-col gap-0.5">
				<h2
					class="px-3 pb-1.5 text-[0.625rem] font-bold tracking-[0.075em] text-nav-group uppercase"
				>
					{locale.t.onThisPage}
				</h2>
				<OnThisPage items={toc} active={spy.active} />
			</nav>

			<button type="button" class="btn btn-secondary px-3" onclick={() => pageLink.copy()}>
				<Icon name={pageLink.copied ? 'check' : 'link'} class="size-4" />
				{pageLink.copied ? locale.t.linkCopied : locale.t.copyPageLink}
			</button>
			<span role="status" class="sr-only">{pageLink.copied ? locale.t.linkCopied : ''}</span>
		</div>
	{/snippet}
</DocsShell>
