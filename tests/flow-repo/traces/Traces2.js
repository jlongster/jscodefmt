// @flow

var React = require('react');

var A = React.createClass({
  propTypes: { foo: React.PropTypes.string.isRequired }
});

var B = React.createClass({
  propTypes: { bar: React.PropTypes.string.isRequired }
});

function f(b): React.Element<*> {
  if (b) {
    return <A foo="hey"/>;
  } else {
    return <B bar="hey"/>;
  }
}
