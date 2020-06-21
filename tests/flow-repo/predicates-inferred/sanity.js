// @flow

// Sanity check: shouldn't be allowed to declare a predicate AND use `chekcs`

function check(y): %checks(typeof y === "string") {
  return typeof y === "number";
}

declare var y: number | boolean;

if (check(y)) {
  (y: number);
}

// Sanity: disallowed body
function indirect_is_number(y): %checks {
  var y = 1;
  return typeof y === "number";
}

function bak(z: string | number): number {
  if (indirect_is_number(z)) {
    return z;
  } else {
    return z.length;
  }
}
