// @flow

// Make sure that destructuring doesn't cause infinite loops when combined with
// funny doses of repositioning

let foo = (i: number) => [i];

const bar = (i: number) => {
  [i] = foo(i);
  return [i];
};

foo = (i: number) => {
  return bar(i);
};

// Also make sure that the following doesn't loop

declare var o;
var { x: o } = o;
