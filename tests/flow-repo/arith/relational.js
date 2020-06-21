/* @flow */

(1 < 2);
(1 < "foo"); // error
("foo" < 1); // error
("foo" < "bar");
(1 < {foo: 1}); // error
({foo: 1} < 1); // error
({foo: 1} < {foo: 1}); // error
("foo" < {foo: 1}); // error
({foo: 1} < "foo"); // error

var x = (null : ?number);
(1 < x); // 2 errors: null !~> number; undefined !~> number
(x < 1); // 2 errors: null !~> number; undefined !~> number

(null < null); // error
(undefined < null); // error
(null < undefined); // error
(undefined < undefined); // error
(NaN < 1);
(1 < NaN);
(NaN < NaN);

let tests = [
  function(x: any, y: number, z: string) {
    (x > y);
    (x > z);
  },
];
