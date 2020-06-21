/* @flow */

function takesNumber(x: number) {}
function takesString(x: string) {}

function num(x: mixed) {
  if (typeof x === "number") {
    takesString(x); // error
    (!x: false); // error: we don't know the truthiness of x
  }
  if (typeof x === "number" && x) {
    (!x: false); // ok
  }
  if (x && typeof x === "number") {
    (!x: false); // ok
  }
}

function str(x: mixed) {
  if (typeof x === "string") {
    takesNumber(x); // error
    (!x: false); // error: we don't know the truthiness of x
  }
  if (typeof x === "string" && x) {
    (!x: false); // ok
  }
  if (x && typeof x === "string") {
    (!x: false); // ok
  }
}

function bool(x: mixed) {
  if (typeof x === "boolean") {
    takesString(x); // error
    (x: true); // error: we don't know the truthiness of x
  }
  if (typeof x === "boolean" && x) {
    (x: true); // ok
  }
  if (x && typeof x === "boolean") {
    (x: true); // ok
  }
}

function fun(x: mixed) {
  if (typeof x === "function") {
    takesString(x); // error
  }
}

function obj0(x: mixed) {
  if (typeof x === "object") {
    takesString(x); // error
  }
}

function obj1(x: mixed) {
  if (Array.isArray(x)) {
    takesString(x); // error
  }
}

function undef(x: mixed) {
  if (typeof x === "undefined") {
    takesString(x); // error
  }
}

function null_(x: mixed) {
  if (x === null) {
    takesString(x); // error
  }
}

function maybe(x: mixed) {
  if (x == null) {
    takesString(x); // error
  }
}

function true_(x: mixed) {
  if (x === true) {
    takesString(x); // error
  }
}

function false_(x: mixed) {
  if (x === false) {
    takesString(x); // error
  }
}

function obj2(x: mixed) {
  if (typeof x === "object") {
    (x: { [key: string]: mixed } | null);
    if (x !== null) {
      (x['foo']: string); // error, mixed
    }
  }
}

function obj2(x: mixed) {
  if (typeof x === "object" && x) {
    (x: Object);
  }
  if (x && typeof x === "object") {
    (x: Object);
  }
  if (x != null && typeof x === "object") {
    (x: Object);
  }
  if (x !== null && typeof x === "object") {
    (x: Object);
  }
}

function arr0(x: mixed) {
  if (Array.isArray(x)) {
    takesString(x[0]); // error
  }
}
