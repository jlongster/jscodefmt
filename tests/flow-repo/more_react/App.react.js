
/**
 * @providesModule App.react
 * @jsx React.DOM
 */

var React = require('react');

// expect args to be strings
function foo(p:string,q:string):string { return p+q; }

var App = React.createClass({

  getDefaultProps: function(): { y: string } {
    return {y:""}; // infer props.y: string
  },

  getInitialState: function() {
    return {z:0}; // infer state.z: number
  },

  handler: function() {
    this.setState({z:42}); // ok
  },

  render: function() {
    var x = this.props.x;
    var y = this.props.y;
    var z = this.state.z;

    //this.state;

    return (
      <div>
        {foo(x,y)}
        {foo(z,x)} // error, since z: number
      </div>
    );
  }

});

module.exports = App;
