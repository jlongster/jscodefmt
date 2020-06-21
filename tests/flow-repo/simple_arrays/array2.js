/* @flow */
var a = [];
for (var i = 0; i < 10; ++i) {
    if (i % 2 == 0) { a[i] = 0; }
    else { a[i] = ''; };
}

function foo(i: number): string { return a[i]; }
