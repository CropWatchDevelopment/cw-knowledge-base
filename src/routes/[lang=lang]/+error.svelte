<script lang="ts">
	import { getLocale } from '#lib/controllers/locale-context.ts';
	import ErrorNotice from '#lib/views/shared/ErrorNotice.svelte';

	const locale = getLocale();
</script>

<ErrorNotice lang={locale.lang} />
