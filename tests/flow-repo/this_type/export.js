export class A1 {
  foo(): this { return this; }
  bar(): this { return this; }
}

export class A2<X> {
  foo(): this { return this; }
  bar(): this { return this; }
  qux(x: X): X { return x; }
}

export class A3<X> extends A2<X> {}
