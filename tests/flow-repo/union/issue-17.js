/* @flow */

type T =
    {type: "a"; a: number} |
    {type: "b"; b: string};

var l: Array<T> = [
    {type: "a", a: 1},
    {type: "a", a: 2},
    {type: "a", a: 3},
    {type: "a", a: 4},
    {type: "b", b: "monkey"},
    {type: "b", b: "gorilla"},
    {type: "b", b: "giraffe"},
    {type: "b", b: "penguin"},
];
