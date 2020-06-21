/**
 * @flow
 */

function foo(o) {
    bar({...o});
}
function bar(_: {foo:number}) { }
foo({foo: 42});
