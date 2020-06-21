// https://babeljs.io/docs/en/babel-plugin-proposal-async-generator-functions

async function* agf() {
  await 1;
  yield 2;
}
