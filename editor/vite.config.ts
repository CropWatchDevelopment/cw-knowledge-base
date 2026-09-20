import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// This app only ever runs with `vite dev` on your own machine (see ../README.md), so it has no adapter.
export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
				experimental: { async: true }
			},
			experimental: { remoteFunctions: true }
		})
	],
	server: {
		// Reachable from the local network, on its own port so the website can run beside it.
		host: true,
		port: 5174,
		strictPort: true,
		// The editor reads the site's models from ../src/lib/models.
		fs: { allow: ['..'] }
	}
});
