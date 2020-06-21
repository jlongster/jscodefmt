var React = require('react');
var Mixin = require('Mixin');
var C = React.createClass({
    mixins: [Mixin],
    propTypes: {
        x: React.PropTypes.string.isRequired,
        y: React.PropTypes.array,
        z: React.PropTypes.number
    },
    replaceProps(props: { }) { },

    getDefaultProps(): { z: number } {
        return { z: 0 };
    },
    getInitialState() { return null; },
    render() {
        var foo: string = this.state;
        var bar: string = this.props;
        var qux: string = this.props.z;
        var w:number = this.props.x;
        this.props.y[0];
        var len:number = this.props.x.length;
        this.success();
        return <div/>;
    }

})

var element = <C x = {0}/>;
var element_ = <C/>;

var x: number = C.displayName;
