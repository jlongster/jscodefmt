/* @flow */

// Testing local binding of React in all kinds of ways. The only reason this
// might even be an issue is that internally, the use of JSX triggers an
// implicit require('react'), so any bugs in (1) interop of CJS require and ES6
// import (2) module re-export, as used to redirect the module name 'React' to
// 'react' might show up here.

import React from "react";
//import React from "React";
//var React = require("react");
//var React = require("React");

class HelloMessage extends React.Component {
  props: { name: string };
}

<HelloMessage name={007} />; // number ~/~> string error
<HelloMessage name="Bond" />; // ok
