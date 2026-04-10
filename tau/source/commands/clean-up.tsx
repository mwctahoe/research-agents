import React, {useState, useEffect} from 'react';
import {Text, Box} from 'ink';
import {execa} from 'execa';
import {ConfirmInput, Spinner} from '@inkjs/ui';

export default function CleanUp() {
	const [cli, setCli] = useState<'docker' | 'podman' | undefined>();
	const [checking, setChecking] = useState(true);
	const [running, setRunning] = useState(false);
	const [result, setResult] = useState<string | undefined>();
	const [error, setError] = useState<string | undefined>();

	useEffect(() => {
		async function checkInstallation() {
			try {
				try {
					await execa('which', ['podman']);
					setCli('podman');
					setChecking(false);
				} catch {
					await execa('which', ['docker']);
					setCli('docker');
					setChecking(false);
				}
			} catch {
				setError('Neither Docker nor Podman seems to be installed.');
				setChecking(false);
			}
		}

		void checkInstallation();
	}, []);

	const handleConfirm = async () => {
		setRunning(true);
		try {
			if (!cli) throw new Error('No CLI tool found');

			const execResult = await execa(cli, [
				'system',
				'prune',
				'-a',
				'--volumes',
				'-f',
			]);
			setResult(
				`Successfully cleaned up using ${cli}:\n${String(execResult.stdout)}`,
			);
		} catch (error_: unknown) {
			const cliName = cli ?? 'CLI';
			const errorMessage =
				error_ instanceof Error
					? error_.message
					: `Failed to clean up using ${cliName}.`;
			setError(errorMessage);
		} finally {
			setRunning(false);
		}
	};

	const handleCancel = () => {
		setResult('Clean-up aborted.');
	};

	if (checking) {
		return (
			<Box margin={1}>
				<Spinner label="Checking for Docker or Podman..." />
			</Box>
		);
	}

	if (error) {
		return (
			<Box borderColor="red" borderStyle="round" margin={1} padding={1}>
				<Text color="red">Error: {error}</Text>
			</Box>
		);
	}

	if (result) {
		return (
			<Box borderColor="green" borderStyle="round" margin={1} padding={1}>
				<Text color="green">{result}</Text>
			</Box>
		);
	}

	if (running) {
		const cliName = cli ?? 'CLI';
		return (
			<Box margin={1}>
				<Spinner
					label={`Running ${cliName} system prune... This may take a while.`}
				/>
			</Box>
		);
	}

	const cliName = cli ?? 'CLI';

	return (
		<Box flexDirection="column" gap={1} margin={1}>
			<Box
				borderColor="yellow"
				borderStyle="round"
				flexDirection="column"
				padding={1}
			>
				<Text bold color="yellow">
					⚠️ Warning: Destructive Action
				</Text>
				<Text>
					This command will run{' '}
					<Text bold>{cliName} system prune -a --volumes -f</Text>
				</Text>
				<Text>It will remove:</Text>
				<Text> • All stopped containers</Text>
				<Text> • All networks not used by at least one container</Text>
				<Text> • All volumes not used by at least one container</Text>
				<Text>
					{' '}
					• All images without at least one container associated to them
				</Text>
				<Text> • All build cache</Text>
			</Box>

			<Box marginTop={1}>
				<Text>Are you sure you want to proceed? </Text>
				<ConfirmInput onCancel={handleCancel} onConfirm={handleConfirm} />
			</Box>
		</Box>
	);
}
