import { describe, expect, it } from 'vitest';
import { youtubeId } from './video.ts';

describe('youtubeId', () => {
	it.each([
		'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
		'https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s',
		'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
		'https://youtu.be/dQw4w9WgXcQ?si=abc',
		'https://www.youtube.com/embed/dQw4w9WgXcQ',
		'https://www.youtube.com/shorts/dQw4w9WgXcQ',
		'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
	])('reads the id from %s', (url) => {
		expect(youtubeId(url)).toBe('dQw4w9WgXcQ');
	});

	it.each(['', 'not a url', 'https://vimeo.com/123456', 'https://www.youtube.com/watch?v=short'])(
		'rejects %j',
		(url) => {
			expect(youtubeId(url)).toBeNull();
		}
	);
});
