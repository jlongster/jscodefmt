type Key1 = 'foo' | 'bar'; // make an enum type with known key set
var o1: {[key: Key1]: number} = {
  foo: 0,
  bar: "", // error: string ~/~ number
};
o1.foo; // OK
o1.qux; // error: qux not found
o1.toString(); // ok

type R = {foo: any, bar: any};
type Key2 = $Keys<R>; // another way to make an enum type, with unknown key set
var o2: {[key: Key2]: number} = { foo: 0 }; // OK to leave out bar
o2.bar; // OK to access bar
o2.qux; // error: qux not found

class C<X> {
  x: $Subtype<{[key: $Keys<X>]: any}>; // object with larger key set than X's
}
class D extends C<{foo: number, bar: string}> {
  x: { foo: number, qux: boolean }; // error: qux not found
}

type AnyKey = $Keys<Object>;
var o3: {[key: AnyKey]: number} = { foo: 0 };
