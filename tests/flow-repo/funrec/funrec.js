function bar(x) { return x; }
function foo() {
    return function bound() {
        return bar(bound);
    };
}
