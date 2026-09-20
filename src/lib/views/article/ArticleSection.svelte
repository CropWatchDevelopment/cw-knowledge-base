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
			'flex flex-col gap-4 md:items-start md:gap-8',
			section.image?.side === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'
		]}
	>
		{#if section.image}
			<figure class="flex shrink-0 flex-col gap-2 md:w-[21.25rem]">
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

		<div class="min-w-0 grow">
			<RichText blocks={section.blocks} />
		</div>
	</div>
</section>
