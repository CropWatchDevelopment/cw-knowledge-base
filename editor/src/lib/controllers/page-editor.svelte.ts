import { isHttpError } from '@sveltejs/kit';
import {
	fromDraft,
	newImage,
	newLink,
	newSection,
	type DraftLink,
	type DraftSection,
	type PageDraft
} from '#lib/models/page-draft.ts';
import { RESERVED_ANCHORS, slugify, uniqueSlug } from '#lib/models/slug.ts';
import { findProblems } from '#lib/models/validation.ts';
import { DEFAULT_LOCALE, type Locale, type SiteIndex } from '#lib/site.ts';
import { savePage } from './content.remote.ts';
import { uploadImage } from './image-upload.ts';

/** The state behind the page editing screen: the draft, the language being written, and saving. */
export class PageEditor {
	draft: PageDraft;
	lang = $state<Locale>(DEFAULT_LOCALE);
	saving = $state(false);
	/** What stopped the last save, in words for the writer. */
	problems = $state<string[]>([]);
	/** True until the page has been written to disk for the first time. */
	isNew: boolean;

	#index: SiteIndex;
	#saved = $state('');
	#addressTyped = $state(false);

	dirty: boolean;
	/** A new page takes its address from the English title until someone types one. */
	slug: string;
	/** The address is part of each picture's path, so it is fixed once a picture has been added. */
	slugLocked: boolean;

	constructor(draft: PageDraft, index: SiteIndex, isNew: boolean) {
		this.draft = $state(draft);
		this.isNew = $state(isNew);
		this.#index = index;
		this.#saved = JSON.stringify(draft);

		this.dirty = $derived(JSON.stringify(this.draft) !== this.#saved);
		this.slug = $derived(
			!this.isNew || this.#addressTyped
				? this.draft.slug
				: slugify(this.draft.title[DEFAULT_LOCALE])
		);
		this.slugLocked = $derived(
			!this.isNew || this.draft.sections.some((section) => section.image?.src)
		);
	}

	setSlug = (typed: string) => {
		this.#addressTyped = true;
		this.draft.slug = slugify(typed);
	};

	/** New sections are named after their English heading; published ones keep the anchor they have. */
	anchorOf(section: DraftSection): string {
		if (section.anchorLocked) return section.id;

		const taken = this.draft.sections
			.filter((other) => other !== section && other.anchorLocked)
			.map((other) => other.id);
		const index = this.draft.sections.indexOf(section);
		const wanted = slugify(section.heading[DEFAULT_LOCALE]) || `section-${index + 1}`;

		return uniqueSlug(wanted, [...taken, ...RESERVED_ANCHORS]);
	}

	addSection = () => {
		this.draft.sections.push(newSection());
	};

	removeSection(section: DraftSection) {
		this.draft.sections = this.draft.sections.filter((other) => other !== section);
	}

	moveSection(section: DraftSection, direction: -1 | 1) {
		const sections = this.draft.sections;
		const from = sections.indexOf(section);
		const to = from + direction;
		if (to < 0 || to >= sections.length) return;
		[sections[from], sections[to]] = [sections[to], sections[from]];
	}

	addLink(kind: DraftLink['kind']) {
		this.draft.links.push(newLink(kind));
	}

	removeLink(link: DraftLink) {
		this.draft.links = this.draft.links.filter((other) => other !== link);
	}

	async addImage(section: DraftSection, file: File) {
		// The picture is stored under the page's address, so from here on the address stays as it is.
		this.draft.slug = this.slug;
		this.#addressTyped = true;

		const uploaded = await uploadImage(this.draft.slug, file);
		section.image = { ...(section.image ?? newImage()), ...uploaded };
	}

	/** Resolves to true once the page is on disk. Otherwise `problems` says what to fix. */
	async save(): Promise<boolean> {
		// Work out the address and any new anchors, so what is checked is exactly what gets written.
		this.draft.slug = this.slug;
		const anchors: string[] = [];
		for (const section of this.draft.sections) {
			section.id = uniqueSlug(this.anchorOf(section), anchors);
			anchors.push(section.id);
		}

		const save = fromDraft($state.snapshot(this.draft));
		this.problems = findProblems(save.page, this.#index, this.isNew);
		if (this.problems.length > 0) return false;

		this.saving = true;
		try {
			await savePage({ ...save, isNew: this.isNew });
		} catch (cause) {
			this.problems = isHttpError(cause)
				? cause.body.message.split('\n')
				: ['The page could not be saved. Is the editor still running?'];
			return false;
		} finally {
			this.saving = false;
		}

		this.isNew = false;
		for (const section of this.draft.sections) section.anchorLocked = true;
		this.#saved = JSON.stringify(this.draft);
		return true;
	}
}
