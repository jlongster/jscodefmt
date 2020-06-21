/* @flow */

var React = require('react');
var Example = React.createClass({
  propTypes: {
    str: React.PropTypes.oneOf(["foo", "bar"]),
    num: React.PropTypes.oneOf([0, 1, 2]),
    bool: React.PropTypes.oneOf([true]),
    mixed: React.PropTypes.oneOf(["foo", 0, true]),
  },
});

(<Example str="foo" />); // OK
(<Example str="baz" />); // error: 'baz' not in enum

(<Example num={0} />); // OK
(<Example num={3} />); // error: 3 not in enum

(<Example bool={true} />); // OK
(<Example bool={false} />); // error: false ~> true

(<Example mixed={"foo"} />); // OK
(<Example mixed={0} />); // OK
(<Example mixed={"baz"} />); // error: 'baz' not in enum

var RequiredExample = React.createClass({
  propTypes: {
    p: React.PropTypes.oneOf([]).isRequired,
  },
});

(<RequiredExample />); // error: `p` not found

var EmptyExample = React.createClass({
  propTypes: {
    nil: React.PropTypes.oneOf([]), // i.e., `empty`
  },
});

(<EmptyExample nil={0} />); // number ~> empty

var AnyArrayExample = React.createClass({
  propTypes: {
    any: React.PropTypes.oneOf((0:any)),
  },
});

(<AnyArrayExample any={0} />); // OK

var AnyElemExample = React.createClass({
  propTypes: {
    any: React.PropTypes.oneOf(["foo", (0:any)]),
  },
});

(<AnyElemExample any={0} />); // OK

var DynamicArrayExample = React.createClass({
  propTypes: {
    dyn: React.PropTypes.oneOf(([]: Array<string>)),
  },
});

(<DynamicArrayExample dyn={0} />); // OK

var DynamicElemExample = React.createClass({
  propTypes: {
    dyn: React.PropTypes.oneOf(["foo", ("": string)]),
  },
});

(<DynamicElemExample dyn={0} />); // OK

var InvalidArrayExample = React.createClass({
  propTypes: {
    p: React.PropTypes.oneOf(0), // error: expected array, got 0
  },
});

(<InvalidArrayExample p={0} />); // OK, don't cascade errors

var NonLiteralElemExample = React.createClass({
  propTypes: {
    p: React.PropTypes.oneOf([{}]), // OK: allow non-literals
  },
});
(<NonLiteralElemExample p={0} />); // OK, result is unknown/any
