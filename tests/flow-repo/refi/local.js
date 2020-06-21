var paths =
[
  function() {
    var x : ?string = "xxx";
    var y : string = x;  // not ok
  },

  function() {
    var x : ?string = "xxx";
    if (x != null) {
      var y : string = x;  // ok
    }
  },

  function() {
    var x : ?string = "xxx";
    if (x == null) {} else {
      var y : string = x;  // ok
    }
  },

  function() {
    var x : ?string = "xxx";
    if (x == null)
      return;
    var y : string = x;  // ok
  },

  function() {
    var x : ?string = "xxx";
    if (!(x != null)) {} else {
      var y : string = x;  // ok
    }
  },

  function() {
    var x : ?string = "xxx";
    if (x != null) {
      alert("");
      var y : string = x;  // ok
    }
  },

  function() {
    var x : ?string = "xxx";
    if (x != null) {}
    var y : string = x;  // not ok
  },

  function() {
    var x : ?string = "xxx";
    if (x != null) {
    } else {
      var y : string = x;  // not ok
    }
  },

  function() {
    var x : ?string = "xxx";
    var y : string = x != null ? x : ""; // ok
  },

  function() {
    var x : ?string = "xxx";
    var y : string = x || ""; // ok
  },

  function() {
    var x : string | string[] = ["xxx"];
    if (Array.isArray(x)) {
      var y : string[] = x; // ok
    } else {
      var z : string = x; // ok
    }
  },

  function() {
    var x : ?string = null;
    if (!x) {
      x = "xxx";
    }
    var y : string = x;
  },
];
