<script lang="ts">
	import { LOCALES, LOCALE_INFO, type Locale } from '#lib/site.ts';

	let { lang = $bindable() }: { lang: Locale } = $props();
</script>

<div
	role="group"
	aria-label="Language you are writing"
	class="flex h-11 items-center gap-1 rounded-xl border border-line bg-muted p-1"
>
	{#each LOCALES as locale (locale)}
		<button
			type="button"
			aria-pressed={lang === locale}
			onclick={() => (lang = locale)}
			class={[
				'h-full rounded-lg px-4 text-sm',
				lang === locale
					? 'border border-[#98adbf] bg-raised font-semibold text-ink shadow-sm'
					: 'border border-transparent font-medium text-ink-2 hover:text-ink'
			]}
		>
			{LOCALE_INFO[locale].label}
		</button>
	{/each}
</div>
