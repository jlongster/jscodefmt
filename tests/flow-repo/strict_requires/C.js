/* @flow */
var o = {
    A: require('./A'),
    ...require('./B'),
};
module.exports = o;
