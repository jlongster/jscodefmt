/* @flow */

function foo(text: string | number): string {
  switch (typeof text) {
　　case 'string':
　　　return text;
    case 'number':
      return text; // error, should return string
　　default:
　　　return 'wat';
　}
}

function bar(text: string | number): string {
  switch (typeof text) {
    case 'string':
      return text[0];
  　default:
      return (text++) + '';
　}
}

function baz1(text: string | number): string {
  switch (typeof text) {
    case 'number':
    case 'string':
      return text[0]; // error, [0] on number
  　default:
      return 'wat';
　}
}

function baz2(text: string | number): string {
  switch (typeof text) {
    case 'string':
    case 'number':
      return text[0]; // error, [0] on number
  　default:
      return 'wat';
　}
}

function corge(text: string | number | Array<string>): string {
  switch (typeof text) {
    case 'object':
      return text[0];
    case 'string':
    case 'number':
      // using ++ since it isn't valid on arrays or strings.
      // should only error for string since Array was filtered out.
      return (text++) + '';
  　default:
      return 'wat';
　}
}
