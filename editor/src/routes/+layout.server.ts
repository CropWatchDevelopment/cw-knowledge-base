import { getPublishStatus } from '#lib/server/git.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => ({ publishStatus: await getPublishStatus() });
