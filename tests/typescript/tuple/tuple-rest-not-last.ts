// https://github.com/babel/babel/pull/11753

let x: [...[number, string], string]

type ValidateArgs = [
	{
		[key: string]: any;
	},
	string,
	string,
	...string[],
];

type ValidateArgs = [
	{
		[key: string]: any;
	},
	string,
	...string[],
	string,
];
