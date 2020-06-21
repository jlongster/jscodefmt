/* propTypes should be a sealed, inexact object just like a type annotation. The
 * below component's propTypes should be equivalent to `{ bar: string }`, which
 * would forbid reads/writes on an unknown `baz` property.
 *
 * If you see a single "number incompatible with string" error instead of two
 * separate "property `baz` not found" errors, this is broken and we are
 * treating propTypes like an unsealed object and performing shadow read/writes.
 */

import React from "react";

React.createClass({
  propTypes: {
    foo: React.PropTypes.string.isRequired,
  },

  f() {
    (this.props.baz: string);
  },

  g() {
    this.props.baz = 0;
  }
});
