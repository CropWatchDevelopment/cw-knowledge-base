import { readIndex } from '#lib/server/content-files.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({ index: await readIndex() });
