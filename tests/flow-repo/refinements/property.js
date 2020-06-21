/* @flow */

function a(x: {[key: string]: ?string}, y: string): string {
  if (x[y]) {
    return x[y];
  }
  return "";
}

function b(x: {y: {[key: string]: ?string}}, z: string): string {
  if (x.y[z]) {
    return x.y[z];
  }
  return "";
}

function c(x: {[key: string]: ?string}, y: {z: string}): string {
  if (x[y.z]) {
    return x[y.z];
  }
  return "";
}

function d(x: {y: {[key: string]: ?string}}, a: {b: string}): string {
  if (x.y[a.b]) {
    return x.y[a.b];
  }
  return "";
}

function a_array(x: Array<?string>, y: number): string {
  if (x[y]) {
    return x[y];
  }
  return "";
}

function b_array(x: {y: Array<?string>}, z: number): string {
  if (x.y[z]) {
    return x.y[z];
  }
  return "";
}

function c_array(x: Array<?string>, y: {z: number}): string {
  if (x[y.z]) {
    return x[y.z];
  }
  return "";
}

function d_array(x: {y: Array<?string>}, a: {b: number}): string {
  if (x.y[a.b]) {
    return x.y[a.b];
  }
  return "";
}

function e_array(x: Array<?string>): string {
  if (x[0]) {
    return x[0];
  }
  return "";
}

// --- name-sensitive havoc ---

function c2(x: {[key: string]: ?string}, y: {z: string}): string {
  if (x[y.z]) {
    y.z = "HEY";
    return x[y.z];  // error
  }
  return "";
}

function c3(x: {[key: string]: ?string}, y: {z: string, a: string}): string {
  if (x[y.z]) {
    y.a = "HEY";
    return x[y.z];  // ok
  }
  return "";
}
