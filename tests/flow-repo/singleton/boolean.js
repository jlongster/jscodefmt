/* @flow */

function veryOptimistic(isThisAwesome: true): boolean {
  return isThisAwesome;
}

var x : boolean = veryOptimistic(true);
var y : boolean = veryOptimistic(false); // error

function veryPessimistic(isThisAwesome: true): boolean {
  return !isThisAwesome; // test bool conversion
}

var x : boolean = veryPessimistic(true);
var y : boolean = veryPessimistic(false); // error

type MyOwnBooleanLOL = true | false

function bar(x: MyOwnBooleanLOL): false {
  if (x) {
    return x;
  } else {
    return !x;
  }
}

bar(true);
bar(false);
bar(1); // error

function alwaysFalsy(x: boolean): false {
  if (x) {
    return !x;
  } else {
    return x;
  }
}
