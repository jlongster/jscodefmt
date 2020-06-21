var tests =
[
  function() {
    var x : {p:?string} = {p:"xxx"};
    var y : string = x.p;  // not ok
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (x.p != null) {
      var y : string = x.p;  // ok
    }
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (x.p == null) {} else {
      var y : string = x.p;  // ok
    }
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (x.p == null)
      return;
    var y : string = x.p;  // ok
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (!(x.p != null)) {} else {
      var y : string = x.p;  // ok
    }
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (x.p != null) {
      alert("");
      var y : string = x.p;  // not ok
    }
  },

  function () {
    var x : {p:?string} = {p:"xxx"};
    if (x.p != null) {
      x.p = null;
      var y : string = x.p;  // not ok
    }
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (x.p != null) {}
    var y : string = x.p;  // not ok
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (x.p != null) {
    } else {
      var y : string = x.p;  // not ok
    }
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    var y : string = x.p != null ? x.p : ""; // ok
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    var y : string = x.p || ""; // ok
  },

  function() {
    var x : {p:string | string[]} = {p:["xxx"]};
    if (Array.isArray(x.p)) {
      var y : string[] = x.p; // ok
    } else {
      var z : string = x.p; // ok
    }
  },

  function() {
    var x : {y: ?string} = {y: null};
    if (!x.y) {
      x.y = "foo";
    }
    (x.y: string);
  },

  function() {
    var x : {y: ?string} = {y: null};
    if (x.y) {
    } else {
      x.y = "foo";
    }
    (x.y: string);
  },

  function() {
    var x : {y: ?string} = {y: null};
    if (!x.y) {
      x.y = 123; // error
    }
    (x.y: string); // error, this got widened to a number
  },

  function() {
    var x : {y: ?string} = {y: null};
    if (x.y) {
      x.y = "foo";
    } else {
      x.y = "bar";
    }
    (x.y : string);
  },

  function() {
    var x : {y: string | number | boolean} = {y: false};
    if (typeof x.y == "number") {
      x.y = "foo";
    }
    (x.y : string); // error, could also be boolean
  },

  function() {
    var x : {y: string | number | boolean} = {y: false};
    if (typeof x.y == "number") {
      x.y = "foo";
    } else if (typeof x.y == "boolean") {
      x.y = "bar";
    }
    (x.y : boolean); // error, string
  },

  function() {
    var x : {y: ?string} = {y: null};
    if (!x.y) {
      x.y = "foo";
    }
    if (x.y) {
      x.y = null;
    }
    (x.y : string); // error
  },

  function() {
    var x : {y: string | number | boolean} = {y: false};
    if (typeof x.y == "number") {
      x.y = "foo";
    }
    // now x.y can is string | boolean
    if (typeof x.y == "string") {
      x.y = false;
    }
    // now x.y is only boolean
    (x.y : string); // error
  },

  function() {
    var x : {y: string | number | boolean} = {y: false};
    if (typeof x.y == "number") {
      x.y = "foo";
    }
    // now x.y can is string | boolean
    if (typeof x.y == "string") {
      x.y = 123;
    }
    // now x.y is number | boolean
    (x.y : string); // error
  },

  function() {
    var x : {y: ?string} = {y: null};
    var z : string = "foo";
    if (x.y) {
      x.y = z;
    } else {
      x.y = z;
    }
    (x.y : string);
  },

  function(x: string) {
    if (x === 'a') {}
    (x: 'b'); // error (but only once, string !~> 'b'; 'a' is irrelevant)
  },

  function(x: mixed) {
    if (typeof x.bar === 'string') {} // error, so `x.bar` refinement is empty
    (x: string & number);
  },

  // --- nested conditionals ---
  // after a branch, the current scope may have changed. this causes the
  // subsequent assignment to refine the new scope. these tests make sure that
  // the scope that gets merged after the if statement is the correct
  // post-condition scope, not the one that was saved at the beginning of the
  // if statement.

  function() {
    let x: { foo: ?string } = { foo: null };
    if (!x.foo) {
      if (false) {}
      x.foo = "foo";
    }
    (x.foo: string);
  },

  function() {
    let x: { foo: ?string } = { foo: null };
    if (!x.foo) {
      while(false) {}
      x.foo = "foo";
    }
    (x.foo: string);
  },

  function() {
    let x: { foo: ?string } = { foo: null };
    if (!x.foo) {
      for (var i = 0; i < 0; i++) {}
      x.foo = "foo";
    }
    (x.foo: string);
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (x.p != null) {
      var {p} = x; // TODO: annot checked against type of x
      (p : string); // ok
    }
  },
];
