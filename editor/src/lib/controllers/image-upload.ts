/** Browser side of adding a picture: shrink it if it is huge, then hand it to the editor's server. */

const MAX_WIDTH = 1600;
const WEBP_QUALITY = 0.88;

export type UploadedImage = { src: string; width: number; height: number };

/**
 * Phone photos are often 4000 pixels wide and several megabytes, far more than the site shows.
 * Anything wider than `MAX_WIDTH` is scaled down and saved as WebP; smaller files go through untouched.
 */
async function prepare(
	file: File
): Promise<{ blob: Blob; name: string; width: number; height: number }> {
	const bitmap = await createImageBitmap(file);
	const { width, height } = bitmap;

	if (width <= MAX_WIDTH || file.type === 'image/gif') {
		bitmap.close();
		return { blob: file, name: file.name, width, height };
	}

	const scaled = { width: MAX_WIDTH, height: Math.round((height * MAX_WIDTH) / width) };
	const canvas = new OffscreenCanvas(scaled.width, scaled.height);
	canvas.getContext('2d')?.drawImage(bitmap, 0, 0, scaled.width, scaled.height);
	bitmap.close();

	return {
		blob: await canvas.convertToBlob({ type: 'image/webp', quality: WEBP_QUALITY }),
		name: file.name.replace(/\.[^.]+$/, '') + '.webp',
		...scaled
	};
}

export async function uploadImage(pageSlug: string, file: File): Promise<UploadedImage> {
	const { blob, name, width, height } = await prepare(file);

	const body = new FormData();
	body.set('slug', pageSlug);
	body.set('file', blob, name);

	const response = await fetch('/upload', { method: 'POST', body });
	if (!response.ok) throw new Error((await response.json()).message);

	const { src } = await response.json();
	return { src, width, height };
}
