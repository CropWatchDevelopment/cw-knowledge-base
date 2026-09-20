import type { Handle } from '@sveltejs/kit/hooks';
import { isLocalNetworkAddress } from '#lib/models/lan.ts';

/** The editor has no login. It answers this computer and the local network, and nobody else. */
export const handle: Handle = ({ event, resolve }) =>
	isLocalNetworkAddress(event.getClientAddress())
		? resolve(event)
		: new Response('The editor is only available on the local network.', { status: 403 });
