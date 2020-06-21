/***
 * consts retain refinements
 * @flow
 */

// global, anybody can call it at any time
var call_me: () => void = () => {};

function g(x: ?number) {

  const const_x = x;
  if (const_x) {
    // ok: if const_x is truthy here, it's truthy everywhere
    call_me = () => { var y:number = const_x; };
  }

  var var_x = x;
  if (var_x) {
    // error: var_x might no longer be truthy when call_me is called
    call_me = () => { var y:number = var_x; };  // error
  }
  var_x = null;
}

function h(x: number | string | boolean) {

  const const_x = x;
  if (typeof(const_x) == "number") {
    call_me = () => { var y:number = const_x; };  // ok
  } else if (typeof(const_x) == "string") {
    call_me = () => { var y:string = const_x; };  // ok
  } else if (typeof(const_x) == "boolean") {
    call_me = () => { var y:boolean = const_x; };  // ok
  }

  var var_x = x;
  if (typeof(var_x) == "number") {
    call_me = () => { var y:number = var_x; };  // error
  } else if (typeof(var_x) == "string") {
    call_me = () => { var y:string = var_x; };  // error
  } else if (typeof(var_x) == "boolean") {
    call_me = () => { var y:boolean = var_x; };  // error
  }
}

// in a galaxy far far away
call_me();
