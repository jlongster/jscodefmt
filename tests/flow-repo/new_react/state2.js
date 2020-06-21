// @flow

var React = require('react');

type FooState = {
    key: ?Object;
};

var Comp = React.createClass({
    getInitialState: function(): FooState {
        return {
            key: null, // this used to cause a missing annotation error
        };
    }
});

module.exports = Comp;
