/**
 * Publishing means committing the content folder and pushing it; Vercel rebuilds the site from there.
 * Only `static/content` is ever added, so code changes are never swept into a content commit.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { REPO_ROOT } from './content-files.ts';

const run = promisify(execFile);
const CONTENT = 'static/content';

async function git(...args: string[]) {
	const { stdout } = await run('git', args, { cwd: REPO_ROOT, maxBuffer: 10 * 1024 * 1024 });
	return stdout;
}

export type PublishStatus = {
	/** `not-a-repo` and `no-remote` mean publishing still has to be set up on this computer. */
	state: 'ready' | 'not-a-repo' | 'no-remote';
	/** Content files that differ from what was last published, relative to `static/content`. */
	changed: string[];
};

export async function getPublishStatus(): Promise<PublishStatus> {
	try {
		await git('rev-parse', '--is-inside-work-tree');
	} catch {
		return { state: 'not-a-repo', changed: [] };
	}

	const hasRemote = (await git('remote')).trim() !== '';

	// Not yet committed, plus committed but not yet pushed.
	const uncommitted = (
		await git('status', '--porcelain', '-z', '--untracked-files=all', '--', CONTENT)
	)
		.split('\0')
		.filter(Boolean)
		.map((entry) => entry.slice(3));
	const unpushed = hasRemote
		? (await git('diff', '--name-only', '-z', '@{upstream}', 'HEAD', '--', CONTENT).catch(() => ''))
				.split('\0')
				.filter(Boolean)
		: [];

	const changed = [...new Set([...uncommitted, ...unpushed])]
		.map((file) => file.replace(`${CONTENT}/`, ''))
		.sort();

	return { state: hasRemote ? 'ready' : 'no-remote', changed };
}

/** Resolves with nothing on success, or with git's own words when something went wrong. */
export async function publish(message: string): Promise<{ error: string } | void> {
	try {
		await git('add', '--', CONTENT);

		const staged = await git('diff', '--cached', '--name-only', '--', CONTENT);
		if (staged.trim() !== '') await git('commit', '-m', message, '--', CONTENT);

		await git('push');
	} catch (cause) {
		const { stderr, message: reason } = cause as { stderr?: string; message: string };
		return { error: (stderr || reason).trim() };
	}
}
