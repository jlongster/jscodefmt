/* @flow */

var React = require('react');

// The builtin $JSXIntrinsics should allow any string

var Div = 'div';
var Bad = 'bad';
var Str: string = 'str';

<Div />; // This is fine
<Bad />; // This is fine
<Str />; // This is fine

React.createElement('div', {}); // This is fine
React.createElement('bad', {}); // This is fine

<Div id={42} />; // This is fine
