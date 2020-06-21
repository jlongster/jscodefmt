/* @flow */
var React = require('react');
var Hello = require('./createclass-module');

var HelloLocal = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
  },

  render: function(): React.Element<*> {
    return <div>{this.props.name}</div>;
  }
});

var Callsite = React.createClass({
  render: function(): React.Element<*> {
    return (
      <div>
        <Hello />
        <HelloLocal />
      </div>
    );
  }
});

module.exports = Callsite;
