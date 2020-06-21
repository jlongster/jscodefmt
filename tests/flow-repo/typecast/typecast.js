/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 */
var tests = [
  () => {
    // erroneous typcasts raise errors...
    var n = ("hey" : number);
    // ...but 'any' does dynamic downcasts, if you must
    var x: number = ("hey": any);
    var y = (("hey": any): number);
  },

  () => {
    // typecasts in sequences
    // (parens always required around typecasts)
    var s: string = ((0: number), ("hey": string));
  },

  () => {
    // TODO pending array element inference issues
    // control case:
    // var a : Array<?number> = [0, 1, 2, 3, 4, 5, 6, 7, null];
    // typecast case:
    // var b = [(0 : ?number), 1, 2, 3, 4, 5, 6, 7, null];
  }
];
