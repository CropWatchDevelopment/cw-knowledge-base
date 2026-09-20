import { loadPageList } from '#lib/controllers/pages.controller.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({ groups: await loadPageList() });
