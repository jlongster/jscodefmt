/* @flow */

(Object({foo: 'bar'}): {foo: string});
(Object("123"): String);
(Object(123): Number);
(Object(true): Boolean);
(Object(null): {});
(Object(undefined): {});
(Object(void(0)): {});
(Object(undefined): Number); // error

var x = Object(null);
x.foo = "bar";

var y = Object("123");
(y.charAt(0): string);

var z = Object(123); // error (next line makes this not match any signatures)
(z.charAt(0): string);
