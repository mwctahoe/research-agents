import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import {execa} from 'execa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const cliPath = path.resolve(projectRoot, 'dist/cli.js');

test.before(async () => {
	if (!fs.existsSync(cliPath)) {
		await execa('npm', ['run', 'build'], {cwd: projectRoot});
	}
});

test('cli --help lists available commands and options', async t => {
	const {stdout} = await execa('node', [cliPath, '--help']);
	const output = String(stdout);

	t.true(output.includes('--name'));
	t.true(output.includes('clean-up'));
	t.true(output.includes('hello-world'));
	t.true(output.includes('repo-status'));
});

test('cli default command greets the provided --name', async t => {
	const {stdout} = await execa('node', [cliPath, '--name=TauUser']);
	t.true(String(stdout).includes('Hello, TauUser'));
});
