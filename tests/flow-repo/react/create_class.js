import React from "react";

const A = React.createClass({
  mixins: [{ propTypes: { foo: React.PropTypes.string.isRequired } }],
  propTypes: { bar: React.PropTypes.number.isRequired },
  m() {
    (this.props.foo: empty); // error: string ~> empty
    (this.props.bar: empty); // error: number ~> empty
  }
});

const B = React.createClass({
  p: "",
  m() {
    this.p = 0; // error: number ~> string
  },
  mm() {
    this.m.apply(null); // OK: this.m is autobound, so `this.p` will always be found
  }
});

const C = React.createClass({
  getInitialState(): Object {
    return { foo: 0 };
  },
  m() {
    this.state.foo; // OK: state is unknown
  }
});

const D = React.createClass({
  mixins: [{
    getInitialState(): Object {
      return { foo: 0 };
    },
  }],
  getInitialState() {
    return { bar: 0 };
  },
  m() {
    this.state.foo; // OK: state is unknown (due to unknown mixin)
  }
});

const E = React.createClass({
  foo: 0,
  m() {
    (this.foo: string); // error: number ~> string
  },
  mm() {
    var props: { m(): void } = { m: this.m };
    props.m(); // OK: this.m is autobound, so `this.foo` will always be found
  }
});

const F = React.createClass({
  getInitialState(): { [string]: mixed } {
    return { foo: 0 };
  },
  m() {
    this.state.foo;
    this.state.bar;
  },
});

const G = React.createClass({
  mixins: [],
  autobind: true,
  statics: {},
  m() {
    (this.mixins: mixed); // error: property `mixins` not found
    (this.autobind: mixed); // error: property `autobind` not found
    (this.statics: mixed); // error: property `statics` not found
  },
});

const H = React.createClass({
  statics: { q: 0 },
  getDefaultProps() {
    (this.q: empty); // error: number ~> empty
    return {};
  },
});

const I = React.createClass({
  propTypes: ({}: {[string]: any}),
  m() {
    (this.props.foo: empty); // OK
  }
});

const J = React.createClass({
  mixins: [{
    getInitialState() {
      return this.constructor.calculateState();
    },
  }],
  statics: {
    calculateState() {
      return { foo: 0 };
    },
  },
  m() {
    (this.state.foo: empty); // number ~> empty
  },
});

const K = React.createClass({
  propTypes: {
    foo: React.PropTypes.string.isRequired,
  },
  getInitialState() {
    this.mm(); // cause error in mm below
    return this.props;
  },
  m() {
    (this.props.foo: empty); // string ~> empty
    (this.state.foo: empty); // string ~> empty
  },
  mm() {
    this.state.foo; // error: property fo not found (called by getInitialState)
  }
});

const L = React.createClass({
  propTypes: {
    foo: React.PropTypes.string.isRequired,
  },
  getInitialState() {
    return { bar: 0 };
  },
  componentWillMount() {
    (this.props.foo: empty); // string ~> empty
    return 0; // number ~> void
  },
  componentDidMount() {
    (this.props.foo: empty); // string ~> empty
    return 0; // number ~> void
  },
  componentWillReceiveProps(nextProps) {
    (this.props.foo: empty); // string ~> empty
    (nextProps.foo: empty); // string ~> empty
    return 0; // number ~> void
  },
  shouldComponentUpdate(nextProps, nextState) {
    (this.props.foo: empty); // string ~> empty
    (this.state.bar: empty); // number ~> empty
    (nextProps.foo: empty); // string ~> empty
    (nextState.bar: empty); // number ~> empty
    return 0; // number ~> bool
  },
  componentWillUpdate(nextProps, nextState) {
    (this.props.foo: empty); // string ~> empty
    (this.state.bar: empty); // number ~> empty
    (nextProps.foo: empty); // string ~> empty
    (nextState.bar: empty); // number ~> empty
    return 0; // number ~> void
  },
  componentDidUpdate(nextProps, nextState) {
    (this.props.foo: empty); // string ~> empty
    (this.state.bar: empty); // number ~> empty
    (nextProps.foo: empty); // string ~> empty
    (nextState.bar: empty); // number ~> empty
    return 0; // number ~> void
  },
  componentWillUnmount() {
    (this.props.foo: empty); // string ~> empty
    (this.state.bar: empty); // number ~> empty
    return 0; // number ~> void
  },
});

React.createClass({}); // error: spec must be [x] exact and [ ] sealed
React.createClass(({}: {})); // error: spec must be [ ] exact and [x] sealed
