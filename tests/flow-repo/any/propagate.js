// @flow

declare class C {
  bar(n1: number, n2: number): number;
  bar(s1: string, s2: string): string;
}

function foo(c: C, x: any): string {
  let y = x.y;
  return c.bar(0, y); // should be able to select first case and error
}

var any_fun1 = require('./nonflowfile');
function bar1(x: mixed) {
  if (any_fun1(x)) {
    (x: boolean);
  }
}

var any_fun2 = require('./anyexportflowfile');
function bar2(x: mixed) {
  if (any_fun2(x)) {
    (x: boolean);
  }
}
