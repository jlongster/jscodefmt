/* @flow */

/* This test documents an issue we used to have with merging the environment of
 * the try block and the catch block. The error variable, when inspected and in
 * the presence of an abnormal, would sometimes kind of leak. It would hit an
 * abnormal. It was weird.
 */
function foo() {
  try {
  } catch(error) {
    if (error.foo === 4) {
      throw error;
    }
  }
}
