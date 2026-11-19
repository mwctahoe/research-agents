import React from 'react';
import test from 'ava';
import {render} from 'ink-testing-library';
import CleanUp, {type CommandRunner} from '../source/commands/clean-up.js';

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

const flushEffects = async () =>
	new Promise<void>(resolve => {
		setTimeout(resolve, 50);
	});

test('shows checking spinner while detecting container CLI', t => {
	const pendingRunner: CommandRunner = async () =>
		new Promise(() => {
			// Never resolves during this check
		});

	const {lastFrame, unmount} = render(<CleanUp runCommand={pendingRunner} />);
	t.true(lastFrame()?.includes('Checking for Docker or Podman...'));
	unmount();
});

test('detects podman when available and prompts for confirmation', async t => {
	const mockRunner: CommandRunner = async (file, arguments_) => {
		if (file === 'which' && arguments_?.[0] === 'podman') {
			return {stdout: '/usr/bin/podman'};
		}

		throw new Error('unexpected call');
	};

	const {lastFrame, unmount} = render(<CleanUp runCommand={mockRunner} />);
	const output = await waitForFrame(lastFrame, frame =>
		frame.includes('Are you sure you want to proceed?'),
	);

	t.true(output.includes('Warning: Destructive Action'));
	t.true(output.includes('podman system prune -a --volumes -f'));
	t.true(output.includes('Are you sure you want to proceed?'));
	unmount();
});

test('falls back to docker when podman is not installed', async t => {
	const mockRunner: CommandRunner = async (file, arguments_) => {
		if (file === 'which' && arguments_?.[0] === 'podman') {
			throw new Error('not found');
		}

		if (file === 'which' && arguments_?.[0] === 'docker') {
			return {stdout: '/usr/bin/docker'};
		}

		throw new Error('unexpected call');
	};

	const {lastFrame, unmount} = render(<CleanUp runCommand={mockRunner} />);
	const output = await waitForFrame(lastFrame, frame =>
		frame.includes('docker system prune'),
	);

	t.true(output.includes('docker system prune -a --volumes -f'));
	unmount();
});

test('shows error when neither docker nor podman is installed', async t => {
	const failingRunner: CommandRunner = async () => {
		throw new Error('not found');
	};

	const {lastFrame} = render(<CleanUp runCommand={failingRunner} />);
	const output = await waitForFrame(lastFrame, frame =>
		frame.includes('Error:'),
	);

	t.true(
		output.includes('Error: Neither Docker nor Podman seems to be installed.'),
	);
});

test('aborts clean-up when user declines confirmation', async t => {
	const mockRunner: CommandRunner = async (file, arguments_) => {
		if (file === 'which' && arguments_?.[0] === 'podman') {
			return {stdout: '/usr/bin/podman'};
		}

		throw new Error('should not run prune');
	};

	const {stdin, lastFrame} = render(<CleanUp runCommand={mockRunner} />);
	await waitForFrame(lastFrame, frame =>
		frame.includes('Are you sure you want to proceed?'),
	);
	await flushEffects();

	stdin.write('n');
	const output = await waitForFrame(lastFrame, frame =>
		frame.includes('Clean-up aborted.'),
	);

	t.true(output.includes('Clean-up aborted.'));
});

test('shows running spinner, executes system prune, and displays output when user confirms', async t => {
	const calls: Array<{file: string; args: readonly string[] | undefined}> = [];
	let resolvePrune: ((value: {stdout: string}) => void) | undefined;

	const mockRunner: CommandRunner = async (file, arguments_) => {
		calls.push({file, args: arguments_});

		if (file === 'which' && arguments_?.[0] === 'podman') {
			return {stdout: '/usr/bin/podman'};
		}

		if (file === 'podman') {
			return new Promise<{stdout: string}>(resolve => {
				resolvePrune = resolve;
			});
		}

		throw new Error('unexpected call');
	};

	const {stdin, lastFrame} = render(<CleanUp runCommand={mockRunner} />);
	await waitForFrame(lastFrame, frame =>
		frame.includes('Are you sure you want to proceed?'),
	);
	await flushEffects();

	stdin.write('y');
	const runningOutput = await waitForFrame(lastFrame, frame =>
		frame.includes('Running podman system prune... This may take a while.'),
	);

	t.true(
		runningOutput.includes(
			'Running podman system prune... This may take a while.',
		),
	);

	resolvePrune?.({stdout: 'Total reclaimed space: 1.2GB'});
	const output = await waitForFrame(lastFrame, frame =>
		frame.includes('Successfully cleaned up using podman:'),
	);

	t.true(output.includes('Successfully cleaned up using podman:'));
	t.true(output.includes('Total reclaimed space: 1.2GB'));
	t.deepEqual(calls[1], {
		file: 'podman',
		args: ['system', 'prune', '-a', '--volumes', '-f'],
	});
});

test('displays error message when system prune fails with Error instance', async t => {
	const mockRunner: CommandRunner = async (file, arguments_) => {
		if (file === 'which' && arguments_?.[0] === 'docker') {
			return {stdout: '/usr/bin/docker'};
		}

		if (file === 'docker') {
			throw new Error('Cannot connect to the Docker daemon');
		}

		throw new Error('not found');
	};

	const {stdin, lastFrame} = render(<CleanUp runCommand={mockRunner} />);
	await waitForFrame(lastFrame, frame =>
		frame.includes('Are you sure you want to proceed?'),
	);
	await flushEffects();

	stdin.write('y');
	const output = await waitForFrame(lastFrame, frame =>
		frame.includes('Error:'),
	);

	t.true(output.includes('Error: Cannot connect to the Docker daemon'));
});

test('displays fallback error message when system prune rejects with non-Error value', async t => {
	const mockRunner: CommandRunner = async (file, arguments_) => {
		if (file === 'which' && arguments_?.[0] === 'podman') {
			return {stdout: '/usr/bin/podman'};
		}

		if (file === 'podman') {
			// eslint-disable-next-line @typescript-eslint/no-throw-literal
			throw 'unexpected failure';
		}

		throw new Error('not found');
	};

	const {stdin, lastFrame} = render(<CleanUp runCommand={mockRunner} />);
	await waitForFrame(lastFrame, frame =>
		frame.includes('Are you sure you want to proceed?'),
	);
	await flushEffects();

	stdin.write('y');
	const output = await waitForFrame(lastFrame, frame =>
		frame.includes('Error:'),
	);

	t.true(output.includes('Error: Failed to clean up using podman.'));
});
