var void_tests =
[
  // NOTE: not (yet?) supporting non-strict eq test for undefined

  // expr !== void(...)
  function() {
    var x : ?string = "xxx";
    if (x !== void(0) && x !== null) {
      var y : string = x;  // ok
    }
  },

  function() {
    var x : ?string = "xxx";
    if (void(0) !== x && x !== null) {
      var y : string = x;  // ok
    }
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (x.p !== void(0) && x.p !== null) {
      var y : string | void = x.p;  // ok
    }
  },

  function() {
    var x : {p:{q:?string}} = {p:{q:"xxx"}};
    if (x.p.q !== void(0) && x.p.q !== null) {
      var y : string = x.p.q;  // ok
    }
  },

  // expr === void(...)
  function() {
    var x : ?string = "xxx";
    if (x === void(0) || x === null) {} else {
      var y : string = x;  // ok
    }
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (x.p === void(0) || x.p === null) {} else {
      var y : string = x.p;  // ok
    }
  },

  function() {
    var x : {p:{q:?string}} = {p:{q:"xxx"}};
    if (x.p.q === void(0) || x.p.q === null) {} else {
      var y : string = x.p.q;  // ok
    }
  },
];

// this.p op void(...)
class A {
  p: ?string;

  ensure0(): string {
    if (this.p !== void(0) && this.p !== null)
      return this.p;
    else
      return "";
  }

  ensure1(): string {
    if (this.p === void(0) || this.p === null)
      return "";
    else
      return this.p;
  }
}
