
/* @providesModule JSX */

var React = require('react');
var App = require('App.react');

var app =
  <App y={42}> // error, y: number but foo expects string in App.react
    Some text.
  </App>;

module.exports = app;
