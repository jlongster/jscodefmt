const React = require("react");

var AnyExample = React.createClass({
  propTypes: {
    foo: (0: any), // OK
  },
});

(<AnyExample />); // OK
(<AnyExample foo={(0: mixed)} />); // OK

var AnyFunExample = React.createClass({
  propTypes: {
    foo: (() => {}: Function), // OK
  },
});

(<AnyFunExample />); // OK
(<AnyFunExample foo={(0: mixed)} />); // OK
