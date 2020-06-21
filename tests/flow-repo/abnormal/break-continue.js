function foo() {
    while(true) { break; }
}

function bar() {
    L: do { continue L; } while(false)
}
