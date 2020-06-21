// @flow

type Binary = 0 | 1;

function stringifyBinary(binary: Binary): string {
  if (binary === 0) {
    return 'zero';
  } else if (binary === 2) { // oops
    return 'one';
  }
  throw "unreachable"; // TODO: this shouldn't be needed
}
