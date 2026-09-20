import type { Attachment } from 'svelte/attachments';

/**
 * Tracks which section the reader is in, for the "On this page" list.
 * Attach `track` to each section element: `<section id="…" {@attach spy.track}>`.
 */
export class ScrollSpy {
	active = $state<string>();

	/** In page order, because sections attach in the order they are rendered. */
	#sections: { element: HTMLElement; visible: boolean }[] = [];
	#observer: IntersectionObserver | undefined;

	track: Attachment<HTMLElement> = (element) => {
		// A band under the sticky header. A section becomes "current" once its top scrolls up into it.
		this.#observer ??= new IntersectionObserver(this.#update, {
			rootMargin: '-96px 0px -65% 0px'
		});

		this.#sections.push({ element, visible: false });
		this.#observer.observe(element);

		return () => {
			this.#observer?.unobserve(element);
			this.#sections = this.#sections.filter((section) => section.element !== element);
		};
	};

	#update = (entries: IntersectionObserverEntry[]) => {
		for (const entry of entries) {
			const section = this.#sections.find((candidate) => candidate.element === entry.target);
			if (section) section.visible = entry.isIntersecting;
		}

		// When one section ends and the next begins inside the band, the one arriving wins.
		// When nothing crosses the band, the last one stays highlighted.
		const current = this.#sections.findLast((section) => section.visible);
		if (current) this.active = current.element.id;
	};
}
