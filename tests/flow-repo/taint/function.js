// @flow

let tests = [
  // flows any to each param
  function(x: any, y: $Tainted<string>) {
    x(y); // error, taint ~> any
  },

  // calling `any` returns `any`
  function(x: any, y: $Tainted<string>) {
    let z = x();
    z(y);
  }
];
