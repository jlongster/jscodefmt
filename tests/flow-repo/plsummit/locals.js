/* @flow */

function foo() {
    var x = 0;
    var y = x;
}

function bar(x: ?string): number {
    if (x == null) x = "";
    return x.length;
}
