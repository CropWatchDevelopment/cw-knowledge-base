<script lang="ts">
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import { SITE_LINKS } from '#lib/models/site.ts';

	const locale = getLocale();
</script>

<footer
	class="flex min-h-18 shrink-0 flex-wrap items-center gap-x-6 gap-y-1 border-t border-line-soft bg-sunken px-4 py-4 text-sm text-ink-3 sm:px-6"
>
	<span>© CropWatch</span>
	<div class="grow"></div>
	<a href={SITE_LINKS.website} rel="external" class="text-ink-2 no-underline hover:underline">
		cropwatch.io
	</a>
	<a href={SITE_LINKS.support} rel="external" class="text-ink-2 no-underline hover:underline">
		{locale.t.contactSupport}
	</a>
</footer>
