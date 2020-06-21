/* @flow */

async function testAll() {
  /* This is a test case from https://github.com/facebook/flow/issues/1143
   * which was previously an error due to Array's invariance and an improper
   * definition of Promise.all */
    const x: Array<Promise<?string>> = [];
    const y: Promise<Array<?string>> = Promise.all(x);
    const z: Array<?string> = await y;
}

async function testRace() {
    const x: Array<Promise<?string>> = [];
    const y: Promise<?string> = Promise.race(x);
    const z: ?string = await y;
}
