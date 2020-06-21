/**
 * test initialization tracking for lets
 * @flow
 */

// deferred init on annotated lets is ok
function linear_deferred_init() {
  let x:number;
  x = 0;
  let y:number = x;
}

// use of let before init gives undefined
function linear_pre_init() {
  let x:number;
  let y:?number = x;  // ok
  let z:number = x;   // error
  x = 0;
  let w:number = x;   // ok
}

// self-references in let bindings are not ok
function self_init() {
  let x = x;  // 'x' not initialized!
}

// use of let after partial init (non-exhaustive if) gives undefined
function if_partial_post_init(b) {
  let x:number;
  if (b) {
    x = 0;
  }
  var y:number = x; // error, possibly uninitialized
}

// use of let after guaranteed init (exhaustive if) is ok
function if_post_init(b) {
  let x:number;
  if (b) {
    x = 0;
  } else {
    x = 1;
  }
  var y:number = x;
}

// use of let after partial init (non-exhaustive switch) gives undefined
function switch_partial_post_init(i) {
  let x:number;
  switch (i) {
    case 0:
      x = 0;
      break;
    case 1:
      x = 1;
      break;
  }
  var y:number = x; // error, possibly uninitialized
}

// use of let after guaranteed init (exhaustive switch) is ok
function switch_post_init(i) {
  let x:number;
  switch (i) {
    case 0:
      x = 0;
      break;
    case 1:
      x = 1;
      break;
    default:
      x = 2;
  }
  var y:number = x; // no error, all cases covered
}

// use in a switch after a skipped decl is an error
function switch_scoped_init_2(i) {
  switch (i) {
    case 0:
      let x:number;
    case 1:
      let y:number = x; // error, skipped declaration
  }
}

// while leaves it possibly uninitialized
function while_post_init(b) {
  let x:number;
  while (b) {
    x = 0;
  }
  var y:number = x; // error
}

// do-while is ok, because loop is guaranteed to run at least once
function do_while_post_init(b) {
  let x:number;
  do {
    x = 0;
  } while (b);
  var y:number = x; // ok
}

// for-in leaves it possibly uninitialized
function for_in_post_init() {
  var x:number;
  for (var p in {}) {
    x = 0;
  }
  var y:number = x; // error
}

// for-of leaves it possibly uninitialized
function for_of_post_init() {
  var x:number;
  for (var x of []) {
    x = 0;
  }
  var y:number = x; // error
}

// use of let after guaranteed init (exhaustive switch + throw) is ok
function switch_post_init2(i): number {
  let bar;
  switch (i) {
    case 1:
      bar = 3;
      break;
    default:
      throw new Error('Invalid state');
  }
  return bar; // ok, definitely initialized
}

// use of let after guaranteed init (exhaustive switch + throw) is ok
function switch_post_init2(i): number {
  let bar;
  switch (i) {
    case 1:
      bar = 3;
      break;
    default:
      throw new Error('Invalid state');
  }
  return bar; // ok, definitely initialized
}

// reference of a let-binding is permitted in a sub-closure within the init expr
function sub_closure_init_reference() {
  let x = function() { return x; };
  const y = function() { return y; };

  // var-bindings can reference each other cyclically since they do not incur a
  // TDZ (...even though this is weird...)
  var z = z;
}
