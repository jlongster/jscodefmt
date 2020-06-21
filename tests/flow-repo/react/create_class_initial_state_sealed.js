import React from "react";

// initial state = None
React.createClass({
  f() {
    this.setState({ q: 0 });
  },
  g() {
    (this.state.q: empty); // number ~> empty
  }
});

// initial state = Some (exact & sealed) [lit]
React.createClass({
  getInitialState() {
    return { p: 0 };
  },
  f() {
    this.setState({ q: 0 });
  },
  g() {
    (this.state.q: empty); // number ~> empty
  }
});

// initial state = Some (exact & sealed) [annot]
React.createClass({
  getInitialState(): {| p: number |} {
    return { p: 0 };
  },
  f() {
    this.setState({ q: 0 });
  },
  g() {
    (this.state.q: empty); // number ~> empty
  }
});

// initial state = Some (inexact & sealed) [annot]
React.createClass({
  getInitialState(): { p: number } {
    return { p: 0 };
  },
  f() {
    this.setState({ q: 0 }); // property `q` not found
  },
  g() {
    (this.state.q: empty); // property `q` not found
  }
});

// mixins = (exact & sealed) + (exact & sealed)
React.createClass({
  mixins: [{
    getInitialState() {
      return { foo: 0 };
    },
  }],
  getInitialState() {
    return { bar: 0 };
  },
  f() {
    this.setState({ baz: 0 });
  },
  g() {
    (this.state.baz: empty); // number ~> empty
  }
});

// mixins = (exact & sealed) + (inexact & sealed)
React.createClass({
  mixins: [{
    getInitialState(): { foo: number } {
      return { foo: 0 };
    },
  }],
  getInitialState() {
    return { bar: 0 };
  },
  f() {
    this.setState({ baz: 0 }); // property `baz`  not found
  },
  g() {
    (this.state.baz: empty); // property `baz` not found
  }
});
