var x;

function foo(bar? = undefined) {
    x = bar;
}

function bar() {
    return x.duck;
}
