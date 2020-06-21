/* @flow */

let tests = [
  function(x: string, y: number) {
    if (x == y) {} // error, string & number are not comparable (unsafe casting)
    if (x === y) {} // no error, to match `let z = (x === y)` which is allowed
  },

  function(x: string) {
    if (x == undefined) {} // ok
    if (x == void 0) {} // ok
  },

  function(x: string) {
    if (x == null) {} // ok
  },

  function(x: { y: 'foo' } | { y: 'bar' }) {
    if (x.y == 123) {} // error
    if (x.y === 123) {} // ok
  },
]
