/**
 * @flow
 */

declare module ModuleAliasFoo {
    declare type baz = number;
    declare type toz = string;
    declare function foo(bar : baz) : toz;
}
