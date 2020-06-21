/* @flow */

var React = require('react');
var Example = React.createClass({
  propTypes: {
    prop: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]).isRequired
  },
  render() {
    if (typeof this.props.prop === "string") {
      return <div>{this.props.prop}</div>
    } else {
      return <div>{this.props.prop.toFixed(2)}</div>
    }
  }
});

var ok_number = <Example prop={42} />;
var ok_string = <Example prop="bar" />;

var fail_missing = <Example />;
var fail_bool = <Example prop={true} />;

/* Since the proptype arguments are not required, React will actually allow
   `null` and `undefined` elements in the `prop` prop, but Flow has currently
   ignores the innter prop types' required flags. */
var todo_required = <Example prop={null} />;

var OptionalExample = React.createClass({
  propTypes: {
    p: React.PropTypes.oneOfType([
      React.PropTypes.string,
    ]),
  },
});

(<OptionalExample />); // OK
(<OptionalExample p="" />); // OK
(<OptionalExample p={0} />); // error: number ~> string

var EmptyExample = React.createClass({
  propTypes: {
    nil: React.PropTypes.oneOfType([]), // i.e., `empty`
  },
});

(<EmptyExample nil={0} />); // number ~> empty

var AnyArrayExample = React.createClass({
  propTypes: {
    any: React.PropTypes.oneOfType((0:any)),
  },
});

(<AnyArrayExample any={0} />); // OK

var AnyElemExample = React.createClass({
  propTypes: {
    any: React.PropTypes.oneOfType([
      React.PropTypes.string,
      (0:any),
    ]),
  },
});

(<AnyElemExample any={0} />); // OK

var DynamicArrayExample = React.createClass({
  propTypes: {
    dyn: React.PropTypes.oneOfType(([]: Array<Function>)),
  },
});

(<DynamicArrayExample dyn={0} />); // OK

var DynamicElemExample = React.createClass({
  propTypes: {
    dyn: React.PropTypes.oneOfType([
      React.PropTypes.string,
      (() => {}: Function),
    ]),
  },
});

(<DynamicElemExample dyn={0} />); // OK

var InvalidArrayExample = React.createClass({
  propTypes: {
    p: React.PropTypes.oneOfType(0), // error: expected array, got 0
  },
});

(<InvalidArrayExample p={0} />); // OK, don't cascade errors

var InvalidElemExample = React.createClass({
  propTypes: {
    p: React.PropTypes.oneOfType([{}]), // error: expected prop type, got {}
  },
});

(<InvalidElemExample p={0} />); // OK, don't cascade errors
