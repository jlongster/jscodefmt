/* @flow */

(`foo`: string); // ok
(`bar`: 'bar'); // ok
(`baz`: number); // error

`foo ${123} bar`; // ok, number can be appended to string
`foo ${{bar: 123}} baz`; // error, object can't be appended

let tests = [
  function(x: string) {
    `foo ${x}`; // ok
    `${x} bar`; // ok
    `foo ${'bar'} ${x}`; // ok
  },
  function(x: number) {
    `foo ${x}`; // ok
    `${x} bar`; // ok
    `foo ${'bar'} ${x}`; // ok
  },
  function(x: boolean) {
    `foo ${x}`; // error
    `${x} bar`; // error
    `foo ${'bar'} ${x}`; // error
  },
  function(x: mixed) {
    `foo ${x}`; // error
    `${x} bar`; // error
    `foo ${'bar'} ${x}`; // error
  },
];
