/* @flow */

function foo0(x: Array<{[key: string]: mixed}>): Array<{[key: string]: mixed}> {
  // this adds a fooBar property to the param type, which should NOT cause
  // an error in the return type because it is a dictionary.
  x[0].fooBar = 'foobar';
  return x;
}

function foo2(
  x: {[key: string]: number}
): {[key: string]: number, +toString: () => string} {
  // x's prototype has a toString method
  return x;
}
