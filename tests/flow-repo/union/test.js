var C = require('test-lib');

// TODO: spurious error! (replacing C with number makes the error go away)
// type Foo<X> = Array<C> | Array<?C>;
type Foo<X:?C> = Array<X>; // workaround
var x:Array<C> = [];
var y:Array<?C> = [];
function foo<X>(x:Foo<X>) {}
foo(x);
foo(y);

// TODO: spurious error! (replacing C with number makes the error go away)
// type Bar = (() => C) | (() => string);
type Bar = () => (C | string); // workaround

function f() { return ""; }
function bar(x:Bar) { }
bar(f);
