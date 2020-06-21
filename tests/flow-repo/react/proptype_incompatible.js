const React = require("react");

var Example = React.createClass({
  propTypes: {
    foo: 0, // error: `0` is not a prop type
  },
});

(<Example />); // OK: don't cascade errors
(<Example foo={(0:mixed)} />); // OK: don't cascade errors
