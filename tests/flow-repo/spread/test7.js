// @flow

let tests = [
  function(x: Object) {
    ({...x}: Object);
    ({...x}: void); // error, Object
  },
];
