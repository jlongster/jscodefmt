/* @flow */

process.nextTick(() => {});

process.nextTick(
  (a: string, b: number, c: boolean) => {},
  'z',
  1,
  true
);

process.nextTick(
  (a: string, b: number, c: boolean) => {},
  0, // Error: number ~> string
  1,
  null // Error: null ~> boolean
);

process.nextTick(
  (a: string, b: number, c: boolean) => {},
  'z',
  'y', // Error: string ~> number
  true
);

process.nextTick(
  (a: string, b: number, c: boolean) => {} // Error: too few arguments
);
