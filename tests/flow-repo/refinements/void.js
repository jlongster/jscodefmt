/* @flow */

function void_var(x: ?number) {
  if (x !== null && x !== void(0)) {
    var y = x * 1000;
  }
}

function void_var_rev(x: ?number) {
  if (x === null || x === void(0)) {
  } else {
    var y = x * 1000;
  }
}

function void_pro(x: { x: ?number }) {
  if (x.x !== null && x.x !== void(0)) {
    var y = x.x * 1000;
  }
}

function void_pro_rev(x: { x: ?number }) {
  if (x.x === null || x.x === void(0)) {
  } else {
    var y = x.x * 1000;
  }
}

function void_var_fail(x: ?number) {
  if (x !== void(0)) {
    var y = x * 1000;
  }
}

function void_var_fail_rev(x: ?number) {
  if (x === void(0)) {
  } else {
    var y = x * 1000;
  }
}

function void_pro_fail(x: { x: ?number }) {
  if (x.x !== void(0)) {
    var y = x.x * 1000;
  }
}

function void_pro_fail_rev(x: { x: ?number }) {
  if (x.x === void(0)) {
  } else {
    var y = x.x * 1000;
  }
}

function void_var_side_effect(x: ?number) {
  if (x !== null && x !== void(x * 1000)) {
    var y = x * 1000;
  }
}

function void_var_side_effect_rev(x: ?number) {
  if (x === null || x === void(x * 1000)) {
  } else {
    var y = x * 1000;
  }
}

function void_prop_side_effect(x: { x: ?number }) {
  if (x.x !== null && x.x !== void(x.x * 1000)) {
    var y = x.x * 1000;
  }
}

function void_prop_side_effect_rev(x: { x: ?number }) {
  if (x.x === null || x.x === void(x.x * 1000)) {
  } else {
    var y = x.x * 1000;
  }
}

function void_bogus_comparison() {
  if (100 * void(0)) {
    return;
  }
  if (void(0) * 100) {
    return;
  }
}

function void_redefined_undefined(x: ?number) {
  var undefined = "foo";
  if (x !== null && x !== void(0)) {
    var y = x * 1000;
  }
}
