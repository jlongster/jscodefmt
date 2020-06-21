/* @flow */

var React = require('react');
var Example = React.createClass({
  propTypes: {
    object: React.PropTypes.object.isRequired
  },
});

var ok_empty = <Example object={{}} />;
var ok_props = <Example object={{foo: "bar"}} />;

var fail_mistyped = <Example object={2} />
