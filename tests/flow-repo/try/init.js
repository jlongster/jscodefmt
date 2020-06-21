/***
 * test initialization tracking of hoisted stuff
 * @flow
 */

// for illustrative purposes only - Flow considers a throw possible
// anywhere within a block
function might_throw() {}

// local use of annotated var within try is ok
function f() {
  try {
    var x:number = 0;
    var y:number = x;
  } catch (e) {
  }
}

// and within catch
function f() {
  try {
  } catch (e) {
    var x:number = 0;
    var y:number = x;
  }
}

// but not across try/catch
function f() {
  try {
    might_throw();
    var x:number = 0;
  } catch (e) {
    var y:number = x; // error
  }
}

// or try/finally
function f() {
  try {
    might_throw();
    var x:number = 0;
  } finally {
    var y:number = x; // error
  }
}

// or catch/finally
function f() {
  try {
  } catch (e) {
    var x:number = 0;
  } finally {
    var y:number = x; // error
  }
}

// or try/catch/finally if init doesn't dominate
function f() {
  try {
    var x:number = 0;
  } catch (e) {
    might_throw();
    var x:number = 0;
  } finally {
    var y:number = x; // error
  }
}

// post-use ok because init dominates here
function f() {
  try {
    var x:number = 0;
  } catch (e) {
    might_throw();  // ...but if so, suffix is not reached
    var x:number = 0;
  }
  var y:number = x;
}

// and here
function f() {
  try {
  } catch (e) {
  } finally {
    might_throw();  // ...but if so, suffix is not reached
    var x:number = 0;
  }
  var y:number = x;
}

// and here
function f() {
  try {
    var x:number;
  } catch (e) {
  } finally {
    might_throw();  // ...but if so, suffix is not reached
    x = 0;
  }
  var y:number = x;
}

// and here, thank you JS for the wonder that is hoisting
function f() {
  try {
  } catch (e) {
    var x:number;
  } finally {
    might_throw();  // ...but if so, suffix is not reached
    x = 0;
  }
  var y:number = x;
}

// error if used prior to init
function f() {
  var y:number = x; // error
  try {
    var x:number = 0;
  } catch (e) {
  }
}

// another non-dominated post
function f() {
  try {
    var x:number = 0;
  } catch (e) {
  }
  var y:number = x; // error
}

// ditto
function f() {
  try {
  } catch (e) {
    var x:number = 0;
  }
  var y:number = x; // error
}

// ditto
function f(b) {
  try {
    var x:number;
    if (b) {
      throw new Error();
    }
    x = 0;
  } catch (e) {
  }
  var y:number = x; // error
}
