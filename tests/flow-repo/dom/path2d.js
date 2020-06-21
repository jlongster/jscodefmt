// @flow

let tests = [
  // arcTo
  function() {
    let path = new Path2D();
    (path.arcTo(0, 0, 0, 0, 10): void); // valid
    (path.arcTo(0, 0, 0, 0, 10, 20, 5): void); // valid
    (path.arcTo(0, 0, 0, 0, 10, '20', 5): void); // invalid
  },
];
