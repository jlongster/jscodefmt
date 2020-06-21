/* @flow */

var React = require('react');
var Example = React.createClass({
  propTypes: {
    func: React.PropTypes.func.isRequired
  },
});

var ok_void = <Example func={() => {}} />;
var ok_args = <Example func={(x) => {}} />;
var ok_retval = <Example func={() => 1} />

var fail_mistyped = <Example func={2} />
