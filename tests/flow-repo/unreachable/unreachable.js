/* @flow */

function foo(x, y) {
  "use strict";
  return bar(x) + baz(y);

  // function declaration is hoisted, should not generate warning
  function bar (ecks) {
    return x + ecks;
  }

  // assignment is not hoisted, should generate warning
  var baz = function (why) {
    return y + why;
  };

  // variable declaration is hoisted, should not generate warning
  var x, y, z;

  // assignments are not hoisted, should generate 2 warnings
  var t,
      u = 5,
      v,
      w = 7;
}

foo(1, 2);
