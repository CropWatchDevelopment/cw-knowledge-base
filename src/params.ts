import { defineParams } from '@sveltejs/kit/params';
import { isLocale } from '#lib/models/locale.ts';

export const params = defineParams({
	lang: (param) => (isLocale(param) ? param : undefined)
});
