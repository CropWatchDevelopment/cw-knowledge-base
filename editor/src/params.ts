import { defineParams } from '@sveltejs/kit/params';
import { isLocale } from '#lib/site.ts';

export const params = defineParams({
	lang: (param) => (isLocale(param) ? param : undefined)
});
