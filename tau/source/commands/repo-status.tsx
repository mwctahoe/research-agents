import React, {useEffect, useState} from 'react';
import {Text, Box} from 'ink';
import {execa} from 'execa';
import {Spinner} from '@inkjs/ui';

export type CommandResult = {
	readonly stdout: unknown;
};

export type CommandRunner = (
	file: string,
	arguments_?: readonly string[],
) => Promise<CommandResult>;

type Props = {
	readonly runCommand?: CommandRunner;
};

export default function RepoStatus({runCommand = execa}: Props) {
	const [gitStatus, setGitStatus] = useState<string | undefined>();
	const [openPrs, setOpenPrs] = useState<string | undefined>();
	const [assignedPrs, setAssignedPrs] = useState<string | undefined>();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchStatus() {
			try {
				// Get git status
				try {
					const result = await runCommand('git', ['status', '--short']);
					setGitStatus(String(result.stdout) || 'Working tree clean');
				} catch {
					setGitStatus('Not a git repository or git error');
				}

				// Check open PRs in current repo
				try {
					const result = await runCommand('gh', [
						'pr',
						'list',
						'--state',
						'open',
						'--limit',
						'10',
					]);
					setOpenPrs(String(result.stdout) || 'No open PRs in this repo');
				} catch {
					setOpenPrs('Could not fetch PRs (not a github repo or gh CLI error)');
				}

				// Check PRs assigned to current user
				try {
					const result = await runCommand('gh', [
						'pr',
						'list',
						'--assignee',
						'@me',
						'--state',
						'open',
						'--limit',
						'10',
					]);
					setAssignedPrs(String(result.stdout) || 'No PRs assigned to you');
				} catch {
					setAssignedPrs('Could not fetch assigned PRs');
				}
			} finally {
				setLoading(false);
			}
		}

		void fetchStatus();
	}, [runCommand]);

	if (loading) {
		return (
			<Box margin={1}>
				<Spinner label="Fetching repository status..." />
			</Box>
		);
	}

	return (
		<Box flexDirection="column" gap={1} margin={1}>
			<Box
				borderColor="green"
				borderStyle="round"
				flexDirection="column"
				padding={1}
			>
				<Text bold color="green">
					Git Status
				</Text>
				<Text>{gitStatus}</Text>
			</Box>

			<Box
				borderColor="blue"
				borderStyle="round"
				flexDirection="column"
				padding={1}
			>
				<Text bold color="blue">
					Open Pull Requests (Repository)
				</Text>
				<Text>{openPrs}</Text>
			</Box>

			<Box
				borderColor="cyan"
				borderStyle="round"
				flexDirection="column"
				padding={1}
			>
				<Text bold color="cyan">
					Pull Requests Assigned to You
				</Text>
				<Text>{assignedPrs}</Text>
			</Box>
		</Box>
	);
}
