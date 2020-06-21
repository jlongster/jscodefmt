/* @flow */

export type inlinedType1 = number;
var a: inlinedType1 = 42;
var b: inlinedType1 = 'asdf'; // Error: string ~> number

type standaloneType1 = number;
export type {standaloneType1};

type standaloneType2 = number;
export {standaloneType2}; // Error: Missing `type` keyword

export type {talias1, talias2 as talias3, IFoo2} from "./types_only2";

export interface IFoo { prop: number };
