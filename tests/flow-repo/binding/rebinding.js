/* @flow
 * test errors on illegal rebinding/reassignment
 *
 *       type class let const var (reassign)
 * type  x    x      x   x     x   x
 * class x    x      x   x     x
 * let   x    x      x   x     x
 * const x    x      x   x     x   x
 * var   x    x      x   x
 */

// type x *

function type_type() {
  type A = number;
  type A = number;  // error: name already bound
}

function type_class() {
  type A = number;
  class A {}        // error: name already bound
}

function type_let() {
  type A = number;
  let A = 0;        // error: name already bound
}

function type_const() {
  type A = number;
  const A = 0;     // error: name already bound
}

function type_var() {
  type A = number;
  var A = 0;        // error: name already bound
}

function type_reassign() {
  type A = number;
  A = 42;           // error: type alias ref'd from value pos
}

// class x *

function class_type() {
  class A {}
  type A = number;  // error: name already bound
}

function class_class() {
  class A {}
  class A {}        // error: name already bound
}

function class_let() {
  class A {}
  let A = 0;        // error: name already bound
}

function class_const() {
  class A {}
  const A = 0;     // error: name already bound
}

function class_var() {
  class A {}
  var A = 0;        // error: name already bound
}

// let x *

function let_type() {
  let A = 0;
  type A = number;  // error: name already bound
}

function let_class() {
  let A = 0;
  class A {}        // error: name already bound
}

function let_let() {
  let A = 0;
  let A = 0;        // error: name already bound
}

function let_const() {
  let A = 0;
  const A = 0;     // error: name already bound
}

function let_var() {
  let A = 0;
  var A = 0;        // error: name already bound
}

// const x *

function const_type() {
  const A = 0;
  type A = number;  // error: name already bound
}

function const_class() {
  const A = 0;
  class A {}        // error: name already bound
}

function const_let() {
  const A = 0;
  let A = 0;        // error: name already bound
}

function const_const() {
  const A = 0;
  const A = 0;     // error: name already bound
}

function const_var() {
  const A = 0;
  var A = 0;        // error: name already bound
}

function const_reassign() {
  const A = 0;
  A = 42;           // error: cannot be reassigned
}

// var x *

function var_type() {
  var A = 0;
  type A = number;  // error: name already bound
}

function var_class() {
  var A = 0;
  class A {}        // error: name already bound
}

function var_let() {
  var A = 0;
  let A = 0;        // error: name already bound
}

function var_const() {
  var A = 0;
  const A = 0;      // error: name already bound
}

function var_var() {
  var A = 0;
  var A = 0;       // OK
}

// function x *

function function_toplevel() {
  function a() {};
  function a() {}; // OK
}

function function_block() {
  {
    function a() {};
    function a() {}; // error: name already bound
  }
}

// corner cases

function var_shadow_nested_scope() {
  {
    let x = 0;
    {
      var x = 0; // error: name already bound
    }
  }
}

function type_shadow_nested_scope() {
  {
    let x = 0;
    {
      type x = string; // error: name already bound
    }
  }
}

// fn params name clash

function fn_params_name_clash(x, x /* error: x already bound */) {}
function fn_params_clash_fn_binding(x,y) {
  let x = 0; // error: x already bound
  var y = 0; // OK
}
