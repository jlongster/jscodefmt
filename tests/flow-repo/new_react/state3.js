var React = require('react');
var TestState = React.createClass({

    getInitialState: function(): { x: string; } {
        return {
            x: ''
        }
    },

    test: function() {
        var a: number = this.state.x; // error

        this.setState({
            x: false // error
        })
    }

});
