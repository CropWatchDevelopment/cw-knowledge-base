<script lang="ts">
	import { untrack } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import { blocksToDoc, docToBlocks } from '#lib/models/rich-text-doc.ts';
	import type { Block } from '#lib/site.ts';
	import Icon, { type IconName } from './Icon.svelte';

	type Props = {
		/** Read once, when the editor is created. Changes are reported through `onchange`. */
		blocks: Block[];
		label: string;
		onchange: (blocks: Block[]) => void;
		/** Opens the link chooser. Returns a link, '' to remove it, or null if cancelled. */
		onpickLink: (current: string) => Promise<string | null>;
	};

	let { blocks, label, onchange, onpickLink }: Props = $props();

	/** What is switched on where the cursor is, so the toolbar can show it. */
	let on = $state({
		bold: false,
		italic: false,
		bulletList: false,
		orderedList: false,
		blockquote: false,
		link: false
	});

	let editor = $state<Editor>();

	const TOOLS: { name: keyof typeof on; icon: IconName; title: string; run: () => void }[] = [
		{
			name: 'blockquote',
			icon: 'note',
			title: 'Callout',
			run: () => editor?.chain().focus().toggleBlockquote().run()
		},
		{
			name: 'bulletList',
			icon: 'bullets',
			title: 'Bulleted list',
			run: () => editor?.chain().focus().toggleBulletList().run()
		},
		{
			name: 'orderedList',
			icon: 'numbers',
			title: 'Numbered list',
			run: () => editor?.chain().focus().toggleOrderedList().run()
		}
	];

	async function pickLink() {
		if (!editor) return;

		const href = await onpickLink(editor.getAttributes('link').href ?? '');
		if (href === null) {
			editor.commands.focus();
			return;
		}

		// Without extendMarkRange, editing a link only changes the part under the cursor.
		const chain = editor.chain().focus().extendMarkRange('link');
		if (href === '') chain.unsetLink().run();
		else chain.setLink({ href }).run();
	}
</script>

<div
	class="flex flex-col overflow-hidden rounded-md border border-line bg-raised focus-within:border-accent focus-within:ring-1 focus-within:ring-accent"
>
	<div
		role="toolbar"
		aria-label="Formatting for {label}"
		class="flex items-center gap-1 border-b border-line-soft bg-sunken p-1"
	>
		<button
			type="button"
			title="Bold"
			aria-pressed={on.bold}
			onclick={() => editor?.chain().focus().toggleBold().run()}
			class={[
				'size-9 rounded-md text-[0.9375rem] font-bold',
				on.bold ? 'bg-nav-active text-nav-active-ink' : 'text-ink-2 hover:bg-nav-hover'
			]}
		>
			B
		</button>
		<button
			type="button"
			title="Italic"
			aria-pressed={on.italic}
			onclick={() => editor?.chain().focus().toggleItalic().run()}
			class={[
				'size-9 rounded-md font-serif text-base italic',
				on.italic ? 'bg-nav-active text-nav-active-ink' : 'text-ink-2 hover:bg-nav-hover'
			]}
		>
			I
		</button>

		{#each TOOLS as tool (tool.name)}
			<button
				type="button"
				title={tool.title}
				aria-pressed={on[tool.name]}
				onclick={tool.run}
				class={[
					'flex size-9 items-center justify-center rounded-md',
					on[tool.name] ? 'bg-nav-active text-nav-active-ink' : 'text-ink-2 hover:bg-nav-hover'
				]}
			>
				<Icon name={tool.icon} class="size-[1.125rem]" />
			</button>
		{/each}

		<div class="mx-1 h-5 w-px bg-line-soft"></div>

		<button
			type="button"
			onclick={pickLink}
			class={[
				'flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium',
				on.link ? 'bg-nav-active text-nav-active-ink' : 'text-ink-2 hover:bg-nav-hover'
			]}
		>
			<Icon name={on.link ? 'unlink' : 'link'} class="size-4" />
			{on.link ? 'Edit link' : 'Add link'}
		</button>
	</div>

	<div
		{@attach (element) =>
			// The props are read once, on purpose: re-creating the editor on every keystroke
			// would throw away the caret and the undo history.
			untrack(() => {
				const instance = new Editor({
					element,
					content: blocksToDoc(blocks),
					extensions: [
						StarterKit.configure({
							// Only what the website can show. A heading is the section's own heading field.
							heading: false,
							code: false,
							codeBlock: false,
							horizontalRule: false,
							strike: false,
							underline: false,
							link: {
								openOnClick: false,
								autolink: false,
								// `page:…` is how one guide links to another.
								isAllowedUri: (url, ctx) => url.startsWith('page:') || ctx.defaultValidate(url)
							}
						})
					],
					editorProps: { attributes: { class: 'rich-text', 'aria-label': label } },
					onUpdate: ({ editor: changed }) => onchange(docToBlocks(changed.getJSON())),
					onTransaction: ({ editor: changed }) => {
						for (const name of Object.keys(on) as (keyof typeof on)[]) {
							on[name] = changed.isActive(name);
						}
					}
				});

				editor = instance;
				return () => {
					instance.destroy();
					editor = undefined;
				};
			})}
	></div>
</div>
