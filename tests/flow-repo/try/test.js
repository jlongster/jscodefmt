/***
 * test env state tracking thru try/catch/finally
 * @flow
 */

function foo() {
    var x = 0;
    var y;
    try {
        x = "";
    } catch(e) {
        x = false;
        throw -1;
    } finally {
        y = {};
    }
    // here via [try; finally] only.
    x(); // string ~/> function call (no num or bool error)
    y(); // object ~/> function call (no uninitialized error)
}

function bar(response) {
    var payload;
    try {
        payload = JSON.parse(response);
    } catch (e) {
        throw new Error('...');
    }
    // here via [try] only.
    if (payload.error) {    // ok
        // ...
    }
}

function qux() {
    var x = 5;
    try {
        throw -1;
    } finally {
    }
    x(); // unreachable
}
