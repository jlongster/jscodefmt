var React = require('React');

var C = React.createClass({
  getInitialState: function(): { x: number } {
    return { x: 0 };
  },

  render() {
    this.setState({ y: 0 });
    return <div>{this.state.z}</div>
  }

});
