const YOUTUBE_ID = /^[\w-]{11}$/;

/** The 11-character video id from any common YouTube link, or `null` if it is not one. */
export function youtubeId(url: string): string | null {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return null;
	}

	const host = parsed.hostname.replace(/^(www\.|m\.)/, '');
	let id: string | null = null;

	if (host === 'youtu.be') {
		id = parsed.pathname.slice(1).split('/')[0];
	} else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
		const [, first, second] = parsed.pathname.split('/');
		if (first === 'watch') id = parsed.searchParams.get('v');
		else if (first === 'embed' || first === 'shorts' || first === 'live') id = second;
	}

	return id && YOUTUBE_ID.test(id) ? id : null;
}
