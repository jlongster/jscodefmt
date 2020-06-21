/* @flow */

function f<A>(a: A): A { return a + a; } // error
function f<A,B>(a: A, b: B): A {return a + b; } // error
function f<A,B>(a: A, b: B): A {return b + a; } // error
function f<A,B>(a: A, b: B): B {return a + b; } // error
function f<A,B>(a: A, b: B): B {return b + a; } // error
