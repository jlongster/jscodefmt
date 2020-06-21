/** @flow */

// -- types ---

// type aliases are hoisted and always available

type T1 = T2;   // ok
type T2 = number;

// --- lets ---

// to be correct, we would
// - not allow forward refs to lets from value positions,
// while let is in TDZ.
// - allow forward refs to lets from type positions.
//
// currently we're too lenient about TDZ in closures -
// from value positions, we currently enforce TDZ only in-scope.
// this is unsound - a let or const may remain uninitialized when
// a lambda runs. But a simple conservative approach would prohibit
// forward references to let/consts from within lambdas entirely,
// which would be annoying. TODO

function f0() {
  var v = x * c;  // errors, let + const referenced before decl
  let x = 0;
  const c = 0;
}

function f1(b) {
  x = 10;         // error, attempt to write to let before decl
  let x = 0;
  if (b) {
    y = 10;       // error, attempt to write to let before decl
    let y = 0;
  }
}

function f2() {
  {
    var v = x * c; // errors, let + const referenced before decl
  }
  let x = 0;
  const c = 0;
}

// functions are let-scoped and hoisted
function f3() {
  var s: string = foo();          // ok, finds hoisted outer
  {
    var n: number = foo();        // ok, finds hoisted inner
    function foo() { return 0; }
  }
  var s2: string = foo();         // ok, hoisted outer not clobbered
  function foo() { return ""; }
}

// out-of-scope TDZ not enforced. sometimes right...
function f4() {
  function g() { return x + c; }  // ok, g doesn't run in TDZ
  let x = 0;
  const c = 0;
}

// ...sometimes wrong
function f5() {
  function g() { return x; }
  g();          // should error, but doesn't currently
  let x = 0;
  const c = 0;
}

// - from type positions, we currently error on forward refs to any
// value (i.e., class or function). this is a basic flaw in our
// phasing of AST traversal, and will be fixed.
//

var x: C;       // ok

var y = new C(); // error: let ref before decl from value position

class C {}

var z: C = new C(); // ok

// --- vars ---

// it's possible to annotate a var with a non-maybe type,
// but leave it uninitialized until later (as long as it's
// initialized before use)

var a: number;  // not an error per se - only if used before init

function f(n: number) { return n; }

f(a); // error: undefined ~/> number

a = 10;

f(a); // ok, a: number (not ?number)
