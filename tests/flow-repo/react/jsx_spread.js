/* @flow */

var React = require('react');
var Foo = React.createClass({
  propTypes: {
    bar: React.PropTypes.string.isRequired,
  },
});

var props = {bar: 42};
var blah = <Foo {...props} />; // error bar, number given string expected
