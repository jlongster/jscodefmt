var null_tests =
[
  // expr != null
  function() {
    var x : ?string = "xxx";
    if (x != null) {
      var y : string = x;  // ok
    }
  },

  function() {
    var x : ?string = "xxx";
    if (null != x) {
      var y : string = x;  // ok
    }
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (x.p != null) {
      var y : string = x.p;  // ok
    }
  },

  function() {
    var x : {p:{q:?string}} = {p:{q:"xxx"}};
    if (x.p.q != null) {
      var y : string = x.p.q;  // ok
    }
  },

  // expr == null
  function() {
    var x : ?string = "xxx";
    if (x == null) {} else {
      var y : string = x;  // ok
    }
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (x.p == null) {} else {
      var y : string = x.p;  // ok
    }
  },

  function() {
    var x : {p:{q:?string}} = {p:{q:"xxx"}};
    if (x.p.q == null) {} else {
      var y : string = x.p.q;  // ok
    }
  },

  // expr !== null
  function() {
    var x : ?string = "xxx";
    if (x !== null) {
      var y : string | void = x;  // ok
    }
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (x.p !== null) {
      var y : string | void = x.p;  // ok
    }
  },

  function() {
    var x : {p:{q:?string}} = {p:{q:"xxx"}};
    if (x.p.q !== null) {
      var y : string | void = x.p.q;  // ok
    }
  },

  // expr === null
  function() {
    var x : ?string = "xxx";
    if (x === null) {} else {
      var y : string | void = x;  // ok
    }
  },

  function() {
    var x : {p:?string} = {p:"xxx"};
    if (x.p === null) {} else {
      var y : string | void = x.p;  // ok
    }
  },

  function() {
    var x : {p:{q:?string}} = {p:{q:"xxx"}};
    if (x.p.q === null) {} else {
      var y : string | void = x.p.q;  // ok
    }
  },
];

// this.p op null
class C {
  p: ?string;

  ensure0(): string {
    if (this.p != null)
      return this.p;
    else
      return "";
  }

  ensure1(): string {
    if (this.p == null)
      return "";
    return this.p;
  }

  ensure2(): string | void {
    if (this.p !== null)
      return this.p;
    else
      return "";
  }

  ensure3(): string | void {
    if (this.p === null)
      return "";
    return this.p;
  }
}

// super.p op null
class D extends C {

  ensure100(): string {
    if (super.p != null)
      return super.p;
    else
      return "";
  }

  ensure101(): string {
    if (super.p == null)
      return "";
    else
      return super.p;
  }

  ensure103(): string {
    if (super.p != null) {
      alert("");
      return super.p;  // not ok
    }
    return "";
  }
}
