function a(
    // Comment inside
) {
    call();
}

function b
// Comment before
() {
    call();
}

function c() // Comment after
 {
    call();
}

function aa(
    // Comment inside
) {
}

function bb
// Comment before
() {
}

function cc() // Comment after
 {
}

foo = function named(
    // Comment inside
) {
    call();
}

foo = function named
// Comment before
() {}

foo = function named() // Comment after
 {}

foo = function (
    // Comment inside
) {}

foo = function
// Comment before
() {}

foo = function () // Comment after
 {}

foo =  (
    // Comment inside
) => {}

foo = // Comment before
() => {}

foo =  () => // Comment after2
 {}

foo =  (
    // Comment inside
) => 1

foo = // Comment before
() => 1

foo =  () => // Comment after2
 1
