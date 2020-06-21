function fn2(x) { return x.length * 4; }
fn2({length: 'hi'});

function foo(x: Array<number>): string {
  return x.length;
}
