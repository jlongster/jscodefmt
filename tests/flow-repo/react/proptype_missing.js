/* @flow */

/* If you create a react component with createClass() but don't specify the
 * propTypes, what should the type of props be?
 *
 * It used to be an empty object, but we didn't enforce that correctly, so
 * people could do whatever they wanted with this.props.
 *
 * As of 0.21.0 it started to be an error when people used this.props in a
 * strict equality situation. It was weird that this was only sometimes
 * enforced, so glevi changed this.props to be Object by default.
 *
 * We may change this back to the empty object at some point and fix the
 * situations where it didn't used to error
 */
var React = require('react');
var Foo = React.createClass({
  getID(): string {
    // So this would have been an error in 0.21.0 if we didn't make this.props
    // Object
    switch (this.props.name) {
      case 'a': return 'Bob';
      default: return 'Alice';
    }
  },

  render() {
    // But this never errored
    return <div id={this.props.name} />;
  }
});
