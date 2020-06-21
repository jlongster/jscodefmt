/* @flow */

function test1(): string {
  return bar();

  function bar() {
    return 0;
  }
}

// regression test for analysis after abnormal control flow:
// consts must not become bot (EmptyT).

function test2() {
  const n = 0;

  return;

  function f() {
    var x: typeof n = 0;  // no error, n is still number
    var y: string = n;    // error, n is number (EmptyT would work)
  }
}
