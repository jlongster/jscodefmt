// @flow

// Classes

class C {
  foo(): number { return 0; }
  foo(): string { return "hello" } // last wins
  x: number;
  x: string; // last wins
  bar(): number { return 0; }
  bar: string; // field wins over method
  qux: number;
  qux(): string { return "hello" } // method loses to field!
}

// check

((new C).foo(): boolean); // last wins
((new C).x: boolean); // last wins
((new C).bar: boolean); // last wins
((new C).qux: boolean); // weird outlier where last doesn't win in classes

// Objects

const o = {
  foo(): number { return 0; },
  foo(): string { return "hello" }, // last wins
  x: 42,
  x: "hello", // last wins
  bar(): number { return 0; },
  bar: "hello", // last wins
  qux: 42,
  qux(): string { return "hello" }, // last wins
};

// check

(o.foo(): boolean); // last wins
(o.x: boolean); // last wins
(o.bar: boolean); // last wins
(o.qux(): boolean); // last wins
