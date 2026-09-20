<script lang="ts">
	import { page } from '$app/state';
	import { localeFromPath } from '#lib/models/locale.ts';
	import ErrorNotice from '#lib/views/shared/ErrorNotice.svelte';

	// Pages are prerendered, so an address with no page behind it (a mistyped guide, say) matches
	// no route and lands here without the language layout. The language is read from the address.
	const lang = $derived(localeFromPath(page.url.pathname));
</script>

<div class="flex min-h-dvh flex-col">
	<ErrorNotice {lang} />
</div>
