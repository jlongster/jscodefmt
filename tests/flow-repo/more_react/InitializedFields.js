/**
 * @providesModule InitializedFields.react
 */

var React = require('react');

/** This is a regression test for a bug where we forgot to mark the fields of
 * react classes as initialized, when the class was created with createClass().
 * This would manifest as complaining that metric requires an annotation */
var App = React.createClass({
  metrics: [1,2,3],
});

module.exports = App;
