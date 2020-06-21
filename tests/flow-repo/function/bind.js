// @flow

let tests = [
  function(x: (a: string, b: string) => void) {
    let y = x.bind(x, 'foo');
    y('bar'); // ok
    y(123); // error, number !~> string
  },

  // callable objects
  function(x: { (a: string, b: string): void }) {
    let y = x.bind(x, 'foo');
    y('bar'); // ok
    y(123); // error, number !~> string
  },

  // non-callable objects
  function(x: { a: string }) {
    x.bind(x, 'foo'); // error
  },

  // callable objects with overridden `bind` method
  function(x: {(a: string, b: string): void, bind(a: string): void}) {
    (x.bind('foo'): void); // ok
    (x.bind(123): void); // error, number !~> string
  },

];
