// @flow

let tests = [
  function() {
    ({}: {
      [k1: string]: string,
      [k2: number]: number, // error: not supported (yet)
    });
  }
];
