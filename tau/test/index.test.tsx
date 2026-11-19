import React from 'react';
import test from 'ava';
import {render} from 'ink-testing-library';
import Index, {options} from '../source/commands/index.js';

test('greets default user when no name option is provided', t => {
	const parsed = options.parse({});
	t.is(parsed.name, 'Stranger');

	const {lastFrame} = render(<Index options={parsed} />);
	t.true(lastFrame()?.includes('Hello, Stranger'));
});

test('greets custom user when name option is provided', t => {
	const parsed = options.parse({name: 'Alice'});
	t.is(parsed.name, 'Alice');

	const {lastFrame} = render(<Index options={parsed} />);
	t.true(lastFrame()?.includes('Hello, Alice'));
});
