import { readIndex } from '#lib/server/content-files.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => ({ index: await readIndex(params.lang) });
