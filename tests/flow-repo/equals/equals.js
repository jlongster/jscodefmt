/* @flow */

(1 == 1);
("foo" == "bar");
(1 == null);
(null == 1);
(1 == ""); // error
("" == 1); // error

var x = (null : ?number);
(x == 1);
(1 == x);
