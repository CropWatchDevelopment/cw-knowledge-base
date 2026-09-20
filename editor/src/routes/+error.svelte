<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Icon from '#lib/views/Icon.svelte';
</script>

<main class="flex grow flex-col items-center justify-center gap-3 p-10 text-center">
	<p class="text-sm font-semibold text-ink-3">{page.status}</p>
	<h1 class="text-2xl font-bold">{page.error?.message ?? 'Something went wrong'}</h1>
	<a href={resolve('/')} class="mt-2 btn min-h-11 gap-2 btn-primary px-5">
		<Icon name="back" class="size-[1.125rem]" />
		All pages
	</a>
</main>
