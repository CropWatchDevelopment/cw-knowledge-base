<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import type { SectionView } from '#lib/controllers/article.controller.ts';
	import ContentImage from '#lib/views/shared/ContentImage.svelte';
	import RichText from './RichText.svelte';
	import SectionHeading from './SectionHeading.svelte';

	type Props = {
		section: SectionView;
		/** Reports the section to the scroll spy behind "On this page". */
		track: Attachment<HTMLElement>;
	};

	let { section, track }: Props = $props();
</script>

<section id={section.id} {@attach track} class="flex flex-col gap-4">
	<SectionHeading id={section.id} heading={section.heading} />

	<!-- The picture comes first in the markup so it sits above the text on a phone. -->
	<div
		class={[
			'flex flex-col gap-4 @3xl:items-start @3xl:gap-8',
			section.image?.side === 'right' ? '@3xl:flex-row-reverse' : '@3xl:flex-row'
		]}
	>
		<!--
			The text holds a readable measure and the picture takes whatever room is left over, so
			a wide screen makes the illustration bigger rather than stretching the line length.
			The pictures are drawn 680px wide, which is why neither width goes past 42.5rem.
			Below 48rem of room the picture sits above the text instead of being squeezed beside it.
		-->
		{#if section.image}
			<figure
				class="flex max-w-[42.5rem] flex-col gap-2 @3xl:max-w-[34rem] @3xl:shrink-0 @3xl:grow @3xl:basis-[36%]"
			>
				<ContentImage
					src={section.image.src}
					alt={section.image.alt}
					width={section.image.width}
					height={section.image.height}
					caption={section.image.caption}
					class="rounded-lg"
					expandable
				/>
				{#if section.image.caption}
					<figcaption class="text-[0.8125rem] leading-5 text-ink-3">
						{section.image.caption}
					</figcaption>
				{/if}
			</figure>
		{/if}

		<div class="min-w-0 @3xl:max-w-[42rem] @3xl:basis-[42rem]">
			<RichText blocks={section.blocks} />
		</div>
	</div>
</section>
