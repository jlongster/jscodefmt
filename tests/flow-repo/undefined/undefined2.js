// @flow

let tests = [
  function(x: number) {
    var id;
    var name = id ? 'John' : undefined;
    (name: boolean); // error, string or void

    const bar = [
      undefined,
      'bar',
    ];
    (bar[x]: boolean); // error, string or void
  },

  function(x: number) {
    var undefined = 'foo';
    (undefined: string); // ok

    var x;
    if (x !== undefined) {
      x[0]; // should error, could be void
    }

    const bar = [
      undefined,
      'bar',
    ];
    (bar[x]: boolean); // error, string only
  },
];
