var null_tests =
[
  // typeof expr == typename
  function() {
    var x : ?string = "xxx";
    if (typeof x == "string") {
      var y : string = x;  // ok
    }
  },

  function() {
    var x : ?string = "xxx";
    if ("string" == typeof x) {
      var y : string = x;  // ok
    }
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (typeof x.p == "string") {
      var y : string = x.p;  // ok
    }
  },

  function() {
    var x : {p:{q:?string}} = {p:{q:"xxx"}};
    if (typeof x.p.q == "string") {
      var y : string = x.p.q;  // ok
    }
  },

  // typeof expr != typename
  function() {
    var x : ?string = "xxx";
    if (typeof x != "string") {} else {
      var y : string = x;  // ok
    }
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (typeof x.p != "string") {} else {
      var y : string = x.p;  // ok
    }
  },

  function() {
    var x : {p:{q:?string}} = {p:{q:"xxx"}};
    if (typeof x.p.q != "string") {} else {
      var y : string = x.p.q;  // ok
    }
  },

  // typeof expr === typename
  function() {
    var x : ?string = "xxx";
    if (typeof x === "string") {
      var y : string = x;  // ok
    }
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (typeof x.p === "string") {
      var y : string = x.p;  // ok
    }
  },

  function() {
    var x : {p:{q:?string}} = {p:{q:"xxx"}};
    if (typeof x.p.q === "string") {
      var y : string = x.p.q;  // ok
    }
  },

  // typeof expr !== typename
  function() {
    var x : ?string = "xxx";
    if (typeof x !== "string") {} else {
      var y : string = x;  // ok
    }
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (typeof x.p !== "string") {} else {
      var y : string = x.p;  // ok
    }
  },

  function() {
    var x : {p:{q:?string}} = {p:{q:"xxx"}};
    if (typeof x.p.q !== "string") {} else {
      var y : string = x.p.q;  // ok
    }
  },
];

// typeof this.p op typename
class A {
  p: ?string;

  ensure0(): string {
    if (typeof this.p == "string")
      return this.p;
    else
      return "";
  }

  ensure1(): string {
    if (typeof this.p != "string")
      return "";
    else
     return this.p;
  }

  ensure2(): string | void {
    if (typeof this.p === "string")
      return this.p;
    else
      return "";
  }

  ensure3(): string | void {
    if (typeof this.p !== "string")
      return "";
    else
      return this.p;
  }
}
