/* @flow */

declare module 'foo' {
    declare class A {
        toz : number
    }

    declare var n : string;

    declare type Foo = typeof n;
    declare type Bar = A;
    declare type Id<T> = T;

    declare var exports : {
        (a : number, b : number) : number
    };
}
