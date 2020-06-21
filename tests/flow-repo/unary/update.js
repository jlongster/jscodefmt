// @flow

let tests = [
  function(y: number) {
    y++;
    y--;
    ++y;
    --y;
  },

  function(y: string) {
    y++; // error, we don't allow coercion here
    (y: number); // ok, y is a number now
    y++; // error, but you still can't write a number to a string
  },

  function(y: string) {
    y--; // error, we don't allow coercion here
  },

  function(y: string) {
    ++y; // error, we don't allow coercion here
  },

  function(y: string) {
    --y; // error, we don't allow coercion here
  },

  function() {
    const y = 123;
    y++; // error, can't update const
    y--; // error, can't update const
  },

  function(y: any) {
    y++; // ok
  },
];
