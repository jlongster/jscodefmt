/**
 * @flow
 */

import React from "react";

const Example = React.createClass({
  propTypes: {
    get a() { return React.PropTypes.number.isRequired; },
    set b(x: number) { this.c = x; },
    c: React.PropTypes.string,
  }
});

(<Example />); // error: property `a` not found
(<Example a={0} />); // ok
(<Example a="bad" />); // error: number ~> string
(<Example a={0} c={0} />); // error: number ~> string
