/* @flow */

class C { foo: string; }

// OK, `instanceof C` would be true
(Object.create(C.prototype): C);

// OK, `instanceof C` would be true
(Object.create(new C): C);

// error, object literals don't structurally match instances
({ foo: "foo" }: C);

// error, object types don't structurally match instances
type O = { foo: string; }
declare var o: O;
(o: C);
