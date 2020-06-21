import React from "react";

// statics = None
const A = React.createClass({ p: 0 });
(A.bar: empty); // number ~> empty (inflow below)
A.bar = 0;

// statics = Some (exact & sealed) [lit]
const B = React.createClass({
  statics: { foo: 0 },
});
(B.foo: empty); // number ~> empty
(B.bar: empty); // number ~> empty (inflow below)
B.bar = 0;

// statics = Some (exact & sealed) [annot]
const C = React.createClass({
  statics: ({ foo: 0 }: {| foo: number |}),
});
(C.foo: empty); // number ~> empty
(C.bar: empty); // number ~> empty (inflow below)
C.bar = 0;

// statics = Some (inexact & sealed) [annot]
const D = React.createClass({
  statics: ({ foo: 0 }: { foo: number }),
});
(D.foo: empty); // number ~> empty
(D.bar: empty); // property `bar` not found
D.bar = 0; // property `bar` not found

// mixins: (exact & sealed) + (exact & sealed)
const E = React.createClass({
  mixins: [{
    statics: { foo: 0 },
  }],
  statics: { bar: 0 },
});
(E.foo: empty); // number ~> empty
(E.bar: empty); // number ~> empty
(E.baz: empty); // number ~> empty (inflow below)
E.baz = 0;

// mixins: (exact & sealed) + (inexact & sealed)
const F = React.createClass({
  mixins: [{
    statics: ({ foo: 0 }: { foo: number }),
  }],
  statics: { bar: 0 },
});
(F.foo: empty); // number ~> empty
(F.bar: empty); // number ~> empty
(F.baz: empty); // number ~> empty (inflow below)
F.baz = 0;
