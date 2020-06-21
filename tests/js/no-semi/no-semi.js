
// with preexisting semi

x; [1, 2, 3].forEach(fn)
x; [a, b, ...c] = [1, 2]
x; /r/i.test('r')
x; +1
x; - 1
x; ('h' + 'i').repeat(10)
x; (1, 2)
x; (() => {})()
x; ({ a: 1 }).entries()
x; ({ a: 1 }).entries()
x; <Hello />
x; `string`
x; (x, y) => x

// doesn't have to be preceded by a semicolon

class X {} [1, 2, 3].forEach(fn)

// TODO: upgrade parser
// class A {
//   async; // The semicolon is *not* necessary
//   x(){}
// }
// class B {
//   static; // The semicolon *is* necessary
//   x(){}
// }

class C1 {
  get; // The semicolon *is* necessary
  x(){}
}
class C2 {
  get = () => {}; // The semicolon is *not* necessary
  x(){}
}
class C3 {
  set; // The semicolon *is* necessary
  x(){}
}
class C4 {
  set = () => {}; // The semicolon is *not* necessary
  x(){}
}


// don't semicolon if it doesn't start statement

if (true) (() => {})()

class A {
  a = 0;
  [b](){}

  c = 0;
  *d(){}

  e = 0;
  [f] = 0

  // none of the semicolons above this comment can be omitted.
  // none of the semicolons below this comment are necessary.

  q() {};
  [h](){}

  p() {};
  *i(){}

  a = 1;
  get ['y']() {}

  a = 1;
  static ['y']() {}

  a = 1;
  set ['z'](z) {}

  a = 1;
  async ['a']() {}

  a = 1;
  async *g() {}

  a = 0;
  b = 1;
}

// being first/last shouldn't break things
class G1 {
  x = 1
}
class G2 {
  x() {}
}
class G3 {
  *x() {}
}
class G4 {
  [x] = 1
}

// check indentation

if (true) {
  x; (() => {})()
}

// flow

(x: void);
(y: void)

// check statement clauses

do break; while (false)
if (true) do break; while (false)

if (true) 1; else 2
for (;;) ;
for (x of y) ;

debugger

// check that it doesn't break non-ASI

1
- 1

1
+ 1

1
/ 1

arr
[0]

fn
(x)

!1

1
< 1

tag
`string`

x; x => x

x; (a || b).c++

x; ++(a || b).c

while (false)
  (function(){}())

aReallyLongLine012345678901234567890123456789012345678901234567890123456789 *
  (b + c)
