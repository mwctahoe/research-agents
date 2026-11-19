import React from 'react';
import test from 'ava';
import {render} from 'ink-testing-library';
import RepoStatus, {
	type CommandRunner,
} from '../source/commands/repo-status.js';

const waitForFrame = async (
	lastFrame: () => string | undefined,
	predicate: (frame: string) => boolean,
	timeoutMs = 1500,
) => {
	const deadline = Date.now() + timeoutMs;

	while (Date.now() < deadline) {
		const frame = lastFrame() ?? '';
		if (predicate(frame)) {
			return frame;
		}

		// eslint-disable-next-line no-await-in-loop
		await new Promise<void>(resolve => {
			setTimeout(resolve, 10);
		});
	}

	return lastFrame() ?? '';
};

test('shows loading spinner while fetching repository status', t => {
	const pendingRunner: CommandRunner = async () =>
		new Promise(() => {
			// Never resolves during this check
		});

	const {lastFrame, unmount} = render(
		<RepoStatus runCommand={pendingRunner} />,
	);
	t.true(lastFrame()?.includes('Fetching repository status...'));
	unmount();
});

test('renders git status, open PRs, and assigned PRs on success', async t => {
	const calls: Array<{file: string; args: readonly string[] | undefined}> = [];
	const mockRunner: CommandRunner = async (file, arguments_) => {
		calls.push({file, args: arguments_});

		if (file === 'git') {
			return {stdout: ' M source/cli.tsx'};
		}

		if (arguments_?.includes('--assignee')) {
			return {stdout: '#12\tFix linter\tmain'};
		}

		return {stdout: '#10\tAdd feature\tmain'};
	};

	const {lastFrame} = render(<RepoStatus runCommand={mockRunner} />);
	const output = await waitForFrame(lastFrame, frame =>
		frame.includes('Git Status'),
	);

	t.is(calls.length, 3);
	t.true(output.includes('Git Status'));
	t.true(output.includes('M source/cli.tsx'));
	t.true(output.includes('Open Pull Requests (Repository)'));
	t.true(output.includes('#10'));
	t.true(output.includes('Pull Requests Assigned to You'));
	t.true(output.includes('#12'));
});

test('renders empty state messages when commands return empty stdout', async t => {
	const emptyRunner: CommandRunner = async () => ({stdout: ''});

	const {lastFrame} = render(<RepoStatus runCommand={emptyRunner} />);
	const output = await waitForFrame(lastFrame, frame =>
		frame.includes('Working tree clean'),
	);

	t.true(output.includes('Working tree clean'));
	t.true(output.includes('No open PRs in this repo'));
	t.true(output.includes('No PRs assigned to you'));
});

test('renders fallback messages when git and gh commands fail', async t => {
	const failingRunner: CommandRunner = async () => {
		throw new Error('command failed');
	};

	const {lastFrame} = render(<RepoStatus runCommand={failingRunner} />);
	const output = await waitForFrame(lastFrame, frame =>
		frame.includes('Not a git repository or git error'),
	);

	t.true(output.includes('Not a git repository or git error'));
	t.true(
		output.includes('Could not fetch PRs (not a github repo or gh CLI error)'),
	);
	t.true(output.includes('Could not fetch assigned PRs'));
});
