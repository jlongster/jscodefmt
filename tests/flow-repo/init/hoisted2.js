/**
 * test initialization tracking for vars
 * note: for try/catch/finally, see tests/try/init.js
 * @flow
 */

// deferred init on annotated vars is ok
function linear_deferred_init() {
  var x:number;
  x = 0;
  var y:number = x;
}

// ...but use of var before init gives undefined
function linear_pre_init() {
  var x:number;
  var y:number = x; // error
}

// local use of annotated vars in an if is ok
function if_scoped_init(b) {
  if (b) {
    var x:number = 0;
    var y:number = x;
  }
}

// but not across if/else
function if_else_partial_init(b) {
  if (b) {
    var x:number = 0;
  } else {
    var y:number = x; // error
  }
}

// use of var before if gives undefined
function if_pre_init(b) {
  var y:number = x; // error
  if (b) {
    var x:number = 0;
  }
}

// ...and after
function if_partial_post_init(b) {
  if (b) {
    var x:number = 0;
  }
  var y:number = x; // error
}

// ...unless both branches have initialized
function if_post_init(b) {
  if (b) {
    var x:number = 0;
  } else {
    var x:number = 1;
  }
  var y:number = x;
}

// use of var after partial init (non-exhaustive if) gives undefined
function if_partial_post_init(b) {
  var x:number;
  if (b) {
    x = 0;
  }
  var y:number = x; // error, possibly uninitialized
}

// use of var after guaranteed init (exhaustive if) is ok
function if_post_init(b) {
  var x:number;
  if (b) {
    x = 0;
  } else {
    x = 1;
  }
  var y:number = x;
}

// use of var after partial init (non-exhaustive switch) gives undefined
function switch_partial_post_init(i) {
  var x:number;
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

// use of var after guaranteed init (exhaustive switch) is ok
function switch_post_init(i) {
  var x:number;
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

// local use of annotated var in switch is ok
function switch_scoped_init_1(i) {
  switch (i) {
    case 0:
      var x:number = 0;
      var y:number = x;
  }
}

// ...but use of var before switch gives undefined
function switch_scoped_init_2(i) {
  var y:number = x; // error
  switch (i) {
    case 0:
      var x:number = 0;
  }
}

// ...and after
function switch_scoped_init_3(i) {
  switch (i) {
    case 0:
      var x:number = 0;
  }
  var y:number = x; // error
}

// ...and in a fallthrough case without initialization
function switch_scoped_init_4(i) {
  switch (i) {
    case 0:
      var x:number = 0;
    case 1:
      var y:number = x; // error
  }
}

// local use of annotated var in while is ok
function while_scoped_init(b) {
  while (b) {
    var x:number = 0;
    var y:number = x;
  }
}

// ...but use of var before while gives undefined
function while_pre_init(b) {
  var y:number = x; // error
  while (b) {
    var x:number = 0;
  }
}

// ...and after
function while_post_init(b) {
   while (b) {
    var x:number = 0;
  }
  var y:number = x; // error
}

// local use of annotated var in do-while is ok
function do_while_scoped_init(b) {
  do {
    var x:number = 0;
    var y:number = x;
  } while (b);
}

// ...but use before do-while gives undefined
function do_while_pre_init(b) {
  var y:number = x; // error
  do {
    var x:number = 0;
  } while (b);
}

// after is ok, because loop is guaranteed to run
function do_while_post_init(b) {
  do {
    var x:number = 0;
  } while (b);
  var y:number = x;
}

// local use of annotated var in for is ok
function for_scoped_init(b) {
  for (;b;) {
    var x:number = 0;
    var y:number = x;
  }
}

// ...but use before for gives undefined
function for_pre_init(b) {
  var y:number = x; // error
  for (;b;) {
    var x:number = 0;
  }
}

// ...and after
function for_post_init(b) {
   for (;b;) {
    var x:number = 0;
  }
  var y:number = x; // error
}

// local use of annotated var in for-in is ok
function for_in_scoped_init() {
  for (var p in { a:1, b: 2 }) {
    var x:number = 0;
    var y:number = x;
  }
}

// ...but use before while gives undefined
function for_in_pre_init() {
  var y:number = x; // error
  for (var p in { a:1, b: 2 }) {
    var x:number = 0;
  }
}

// ...and after
function for_in_post_init() {
  for (var p in { a:1, b: 2 }) {
    var x:number = 0;
  }
  var y:number = x; // error
}

// local use of annotated var in for-of is ok
function for_of_scoped_init() {
  for (var x of [1, 2, 3]) {
    var x:number = 0;
    var y:number = x;
  }
}

// ...but use before while gives undefined
function for_in_pre_init() {
  var y:number = x; // error
  for (var x of [1, 2, 3]) {
    var x:number = 0;
  }
}

// ...and after
function for_in_post_init() {
  for (var x of [1, 2, 3]) {
    var x:number = 0;
  }
  var y:number = x; // error
}
