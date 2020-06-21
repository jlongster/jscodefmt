/***
 * Test tracking of variable types across closure calls.
 * @flow
 */

function takes_string(_:string) { }

// global write from function
//

var global_x = "hello";

function global_f() { }
function global_g() { global_x = 42; }

global_f();
takes_string(global_x); // ok

global_g();
takes_string(global_x); // error

global_x = 42;  // shouldn't pollute linear refinement

// local write from function
//

function local_func() {

  var local_x = "hello";

  function local_f() { }
  function local_g() { local_x = 42; }

  local_f();
  takes_string(local_x); // ok

  local_g();
  takes_string(local_x); // error

  local_x = 42;  // shouldn't pollute linear refinement
}

// global write from method
//

var global_y = "hello";

var global_o = {
  f: function() { },
  g: function() { global_y = 42; }
}

global_o.f();
takes_string(global_y); // ok

global_o.g();
takes_string(global_y); // error

global_y = 42;  // shouldn't pollute linear refinement

// local write from method
//

function local_meth() {

  var local_y = "hello";

  var local_o = {
    f: function() { },
    g: function() { local_y = 42; }
  }

  local_o.f();
  takes_string(local_y); // ok

  local_o.g();
  takes_string(local_y); // error

  local_y = 42;  // shouldn't pollute linear refinement
}
