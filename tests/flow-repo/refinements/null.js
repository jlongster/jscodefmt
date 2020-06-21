/* @flow */

function null_bogus_comparison() {
  if (100 * null) {
    return;
  }
  if (null * 100) {
    return;
  }
}
