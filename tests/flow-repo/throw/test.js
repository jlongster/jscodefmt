/**
 * @flow
 */

function f(): number {
    throw new Error(); // OK to not return
}

function g(a: ?string) {
    if (a == null) {
        throw new Error();
    }
    return a*1; // a is not null
}

function h(x: number): string {
  if (x) {
    return 'foo';
  } else {
    throw new Error();
  }
}
