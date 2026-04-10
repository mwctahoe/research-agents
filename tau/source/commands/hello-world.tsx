import React from 'react';
import {Box} from 'ink';
import Gradient from 'ink-gradient';
import BigText from 'ink-big-text';

export default function HelloWorld() {
	return (
		<Box margin={2} flexDirection="column" alignItems="center">
			<Gradient name="pastel">
				<BigText text="Hello World" />
			</Gradient>
			<Gradient name="rainbow">
				<BigText text="from Tau" />
			</Gradient>
		</Box>
	);
}
