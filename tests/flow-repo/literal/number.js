function test1(x: number): number {
  return -x;
}

function test2(x: string): number {
  return -x;
}

// sanity checks to make sure merging envs doesn't keep creating new NumT's
// because of the UnaryMinusT's, causing nontermination
function test3(x: number, flip_times: number): number {
  for (var i = 0; i < flip_times; i++) {
    x = -x;
  }
  return x;
}
function test4(flip_times: number): number {
  var x = 1;
  for (var i = 0; i < flip_times; i++) {
    x = -x;
  }
  return x;
}
