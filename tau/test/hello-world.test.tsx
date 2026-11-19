import React from 'react';
import test from 'ava';
import {render} from 'ink-testing-library';
import HelloWorld from '../source/commands/hello-world.js';

test('renders ASCII art greeting banner', t => {
	const {lastFrame} = render(<HelloWorld />);
	const output = lastFrame() ?? '';

	t.true(output.length > 100);
	t.true(output.includes('██'));
});
