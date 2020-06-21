/* @flow */
// issue #1191

const Thing = class Thing {
  zark() {
    this.x = 123; // error: property not found (must be declared)
  }
};
