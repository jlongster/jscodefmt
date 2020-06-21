/* @flow */

(([1, 2]: Array<number>): Iterable<number>);
([1,2,"hi"]: Iterable<number | string>);
([1,2,3]: Iterable<*>);

(["hi"]: Iterable<number>); // Error string ~> number
(["hi", 1]: Iterable<string>); // Error number ~> string
