declare class T {}
declare var x: T;

declare class U {}
declare var y: U;

declare var nil: {||};

// inexact: `p` may be non-own
type O1 = {...{p:T}};
declare var o1: O1;
(o1: {p?:T}); // ok
(o1: {p:T}); // error: o1.p is optional
({}: O1); // ok
({p:x}: O1); // ok
({p:y}: O1); // error: y ~> T
({p:x,q:y}: O1); // ok

// inexact: optional `p`, if own, must be `T`
type O2 = {...{p?:T}};
declare var o2: O2;
(o2: {p?:T}); // ok
(o2: {p:T}); // error: o2.p is optional
({}: O2); // ok
({p:x}: O2); // ok
({p:y}: O2); // error: y ~> T
({p:x,q:y}: O2); // ok

// can't make exact from inexact (TODO: force EvalT eagerly)
type O3 = {|...{p:T}|}; ({p:x}: O3); // error: spread result is not exact

// exact
type O4 = {...{|p:T|}};
declare var o4: O4;
(o4: {p:T}); // ok
(o4: {|p:T|}); // error: not exact
({}: O4); // error: property `p` not found
({p:x}: O4); // ok
({p:y}: O4); // error: y ~> T
({p:x,q:y}: O4); // ok

// can make exact from exact
type O5 = {|...{|p:T|}|};
declare var o5: O5;
(o5: {p:T}); // ok
(o5: {|p:T|}); // ok
(nil: O5); // error: property `p` not found
({p:x}: O5); // ok
({p:y}: O5); // error: y ~> T
({p:x,q:y}: O5); // error: additional property `q` found

// inexact p + exact p
type O6 = {...{p:T},...{|p:U|}};
declare var o6: O6;
(o6: {p:U}); // ok
({}: O6); // error: property `p` not found
({p:x}: O6); // error: x ~> U
({p:y}: O6); // ok
({p:y,q:x}: O6); // ok

// inexact p + exact p ~> exact (TODO: force EvalT eagerly)
type O7 = {|...{p:T},...{|p:U|}|}; ({p:y}: O7);// error: spread result is not exact

// exact p + inexact p
type O8 = {...{|p:T|},...{p:U}};
declare var o8: O8;
(o8: {p:T|U}); // ok
(o8.p: T); // error: U ~> T
(o8.p: U); // error: T ~> U

// inexact p + exact q
type O9 = {...{p:T},...{|q:U|}};
declare var o9: O9;
(o9: {p?:T,q:U});
(o9.p: T); // error: o9.p is optional
(o9.q: U); // ok

// exact p + inexact q
type O10 = {...{|p:T|},...{q:U}};
declare var o10: O10;
(o10: {p:mixed, q?: U}); // ok

// inexact p + inexact q
type O11 = {...{p:T},...{q:U}};
declare var o11: O11;
(o11: {p:mixed, q: mixed}); // ok

// exact + exact
type O12 = {...{|p:T|},...{|q:U|}};
declare var o12: O12;
(o12: {p:T,q:U}); // ok

// inline properties are exact
type O13 = {...{p:T},p:U};
declare var o13: O13;
(o13: {p:U});
