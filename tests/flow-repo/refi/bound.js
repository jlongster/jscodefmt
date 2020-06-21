// refinements of bound vars (closed-over locals)
// should have the same lifetimes as heap objects.

var x : ?string = "xxx";

var tests =
[
  function() {
    var y : string = x;  // not ok
  },

  function() {
    if (x != null) {
      var y : string = x;  // ok
    }
  },

  function() {
    if (x == null) {} else {
      var y : string = x;  // ok
    }
  },

  function() {
    if (x == null)
      return;
    var y : string = x;  // ok
  },

  function() {
    if (!(x != null)) {} else {
      var y : string = x;  // ok
    }
  },

  /* TODO we actually allow this currently; fix
  // requires further remedial work in Env
  function() {
    if (x != null) {
      alert("");
      var y : string = x;  // not ok
    }
  },
  */
  function() {
    if (x != null) {}
    var y : string = x;  // not ok
  },

  function() {
    if (x != null) {
    } else {
      var y : string = x;  // not ok
    }
  },

  function() {
    var y : string = x != null ? x : ""; // ok
  },

  function() {
    var y : string = x || ""; // ok
  },
];
