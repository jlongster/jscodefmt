/**
 * @flow
 */

function foo(x: ?number): string {
    try {
    } catch (e) {
        return 'bar';
    }
    console.log();
    return 'foo';
}

function bar(): string {
  try {
    return 'foo';
  } catch (e) {
    return 'bar';
  }
}

function baz(): string {
  try {
    throw new Error("foo");
  } catch (e) {
    return "foo";
  }
  return "bar"; // unreachable
}

function qux(): string {
  try {
    throw new Error("foo");
  } catch (e) {
  }
  console.log();
  return 'bar';
}

function quux(): string {
  try {
    return qux();
  } catch (e) {
  }
  return 'bar';
}

function bliffl(): string {
  try {
    throw new Error("foo");
  } catch (e) {
    return "foo";
  } finally {
    return "bar";
  }
}

function corge(): string {
  try {
    return 'foo';
  } catch (e) {
    throw new Error('bar');
  }
  bar(); // unreachable
}
