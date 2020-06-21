var React = require('react');
var C = React.createClass({
    propTypes: {
        foo: React.PropTypes.string.isRequired,
        bar: React.PropTypes.string.isRequired,
    }
});
var D = React.createClass({
    getInitialState: function(): { bar: number } {
        return { bar: 0 };
    },
    render: function() {
        var obj = { bar: 0 };
        var s: string = this.state.bar;
        return <C {...this.state} foo = {0} />;
    }
});
