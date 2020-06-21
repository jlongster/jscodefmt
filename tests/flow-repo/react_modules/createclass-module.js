/* @flow */
var React = require('react');

var Hello = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
  },

  render: function(): React.Element<*> {
    return <div>{this.props.name}</div>;
  }
});

module.exports = Hello;
