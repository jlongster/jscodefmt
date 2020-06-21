// @flow

let tests = [
  // setting a property
  function(x: $Tainted<string>, y: string) {
    let obj: Object = {};
    obj.foo = x; // error, taint ~> any
    obj[y] = x; // error, taint ~> any
  },

  // getting a property
  function() {
    let obj: Object = { foo: 'foo' };
    (obj.foo: $Tainted<string>); // ok
  },

  // calling a method
  function(x: $Tainted<string>) {
    let obj: Object = {};
    obj.foo(x); // error, taint ~> any

    let foo = obj.foo;
    foo(x); // error, taint ~> any
  },
];
