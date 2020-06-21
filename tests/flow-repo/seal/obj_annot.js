/* @flow */

function foo(param: { name: string; }): number {
    return param.id;
}

foo({ name: "test" });

module.exports = foo;
