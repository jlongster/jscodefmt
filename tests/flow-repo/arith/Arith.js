
/* @providesModule Arith */

function num(x:number) { }

function str(x:string) { }

function foo() {
  var x = 0;
  var y = "...";
  var z = {};
  num(x+x);
  num(x+y); // error
  str(x+y);
  str(x+x); // error
  str(z+y); // error
}

// test MaybeT(NumT)
function bar0(x: ?number, y: number) {
  num(x + y);
}
function bar1(x: number, y: ?number) {
  num(x + y);
}

// test OptionalT(NumT)
function bar2(x?: number, y: number) {
  num(x + y);
}
function bar3(x: number, y?: number) {
  num(x + y);
}

// test OptionalT(MaybeT(NumT))
function bar4(x?: ?number, y: number) {
  num(x + y);
}
function bar5(x: number, y?: ?number) {
  num(x + y);
}

num(null + null); // === 0
num(undefined + undefined); // === NaN

num(null + 1); // === 1
num(1 + null); // === 1
num(undefined + 1); // === NaN
num(1 + undefined); // === NaN

num(null + true); // === 1
num(true + null); // === 1
num(undefined + true); // === NaN
num(true + undefined); // === NaN

str("foo" + true); // error
str(true + "foo"); // error
str("foo" + null); // error
str(null + "foo"); // error
str("foo" + undefined); // error
str(undefined + "foo"); // error

let tests = [
  function(x: mixed, y: mixed) {
    (x + y); // error
    (x + 0); // error
    (0 + x); // error
    (x + ""); // error
    ("" + x); // error
    (x + {}); // error
    ({} + x); // error
  },

  // when one side is a string or number and the other is invalid, we
  // assume you are expecting a string or number (respectively), rather than
  // erroring twice saying number !~> string and obj !~> string.
  function() {
    ((1 + {}): number); // error: object !~> number
    (({} + 1): number); // error: object !~> number
    (("1" + {}): string); // error: object !~> string
    (({} + "1"): string); // error: object !~> string
  },

  function(x: any, y: number, z: string) {
    (x + y: string); // ok
    (y + x: string); // ok

    (x + z: empty); // error, string ~> empty
    (z + x: empty); // error, string ~> empty
  },
];
