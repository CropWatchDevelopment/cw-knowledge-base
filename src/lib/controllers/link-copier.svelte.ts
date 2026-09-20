const FEEDBACK_MS = 2000;

/** Copies a link to the clipboard and reports `copied` for a moment so the view can confirm it. */
export class LinkCopier {
	copied = $state(false);

	#timer: ReturnType<typeof setTimeout> | undefined;

	/** `hash` like `#section-id` copies a link to that section; omit it for the page itself. */
	copy = async (hash = '') => {
		try {
			await navigator.clipboard.writeText(location.href.split('#')[0] + hash);
		} catch {
			// Clipboard access can be refused (permissions, insecure origin); the link itself still works.
			return;
		}

		this.copied = true;
		clearTimeout(this.#timer);
		this.#timer = setTimeout(() => (this.copied = false), FEEDBACK_MS);
	};
}
