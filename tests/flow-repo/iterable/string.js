/* @flow */

("hi": Iterable<string>);
("hi": Iterable<*>);
("hi": Iterable<number>); // Error - string is a Iterable<string>
