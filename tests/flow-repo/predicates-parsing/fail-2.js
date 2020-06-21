// @flow

var a2 = (x: mixed): %checks (x !== null) => {        // Error: body form
  var x = 1; return x;
}
