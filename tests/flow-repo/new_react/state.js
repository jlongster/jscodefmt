/* @flow */

var React = require('react');

type State = {
    bar: ?{ qux: string; };
};

var ReactClass = React.createClass({
    getInitialState: function():State {
        return { bar: null };
    },

    render: function(): any {
        // Any state access here seems to make state any
        this.state;
        return (
        <div>
                {this.state.bar.qux}
        </div>
        );
    }
});
