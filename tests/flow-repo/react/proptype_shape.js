/* Shape should be a sealed, inexact object just like a type annotation. The
 * below component's `foo` property should be equivalent to `{ bar: string }`,
 * which would forbid reads/writes on an unknown `baz` property.
 *
 * If you see a single "number incompatible with string" error instead of two
 * separate "property `baz` not found" errors, this is broken and we are
 * treating the shape like an unsealed object and performing shadow read/writes.
 */

import React from "react";

React.createClass({
  propTypes: {
    foo: React.PropTypes.shape({
      bar: React.PropTypes.string.isRequired,
    }).isRequired,
  },

  f() {
    (this.props.foo.baz: string);
  },

  g() {
    this.props.foo.baz = 0;
  }
});

React.createClass({
  propTypes: {
    foo: React.PropTypes.shape(({}: {[string]: any})).isRequired,
  },
  f() {
    (this.props.foo.bar: empty); // OK
  },
});
