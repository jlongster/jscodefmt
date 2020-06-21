/* @flow weak */
// This should fail without weak mode, because of the glaring type error.

function returns_a_string() {
  return "Hello";
}

function expects_an_int() {
  return returns_a_string() * 10;
}
