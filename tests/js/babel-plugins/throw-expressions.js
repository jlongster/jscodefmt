// https://babeljs.io/docs/en/babel-plugin-proposal-throw-expressions

function test(param = throw new Error('required!')) {
  const test = param === true || throw new Error('Falsy!');
}
