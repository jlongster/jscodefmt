function foo() {}
const args = [3, 4];

foo(1, 2); // 2 errors
foo(
  1, // error
  2, // error
);
foo(...args); // 2 errors

foo.call(null, 1, 2); // 2 errors
foo.call(null, ...args); // 2 errors
foo.call(null, 1, 2, ...args); // 4 errors

foo.apply(null, [1, 2]); // 2 errors
foo.apply(null, args); // 2 errors

foo.bind(null, 1, 2); // 2 errors
foo.bind(null, ...args); // 2 errors
foo.bind(null, 1, 2, ...args); // 4 errors

new foo(1, 2); // 2 errors
new foo(...args); // 2 errors
new foo(1, 2, ...args); // 4 errors
