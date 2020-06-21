// @flow

declare var pstr: Promise<string>;
declare var pnum: Promise<number>;

Promise.all([
  pstr,
  pnum,
  true, // non-Promise values passed through
]).then((xs) => {
  // tuple information is preserved
  let [a,b,c] = xs;
  (a: number);  // Error: string ~> number
  (b: boolean); // Error: number ~> boolean
  (c: string);  // Error: boolean ~> string

  // array element type is (string | number | boolean)
  xs.forEach(x => {
    (x: void);  // Errors: string ~> void, number ~> void, boolean ~> void
  });
});

// First argument is required
Promise.all(); // Error: expected array instead of undefined (too few arguments)

// Mis-typed arg
Promise.all(0); // Error: expected array instead of number

// Promise.all is a function
(Promise.all : Function);

// Promise.all supports iterables
function test(val: Iterable<Promise<number>>) {
  const r: Promise<Array<number>> = Promise.all(val);
}

function tes2(val: Map<string, Promise<number>>) {
  const r: Promise<Array<number>> = Promise.all(val.values());
}
