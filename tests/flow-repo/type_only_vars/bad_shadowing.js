/**
 * @flow
 */

import typeof A from "./A.js";
import type {Foo, Bar as Baz} from "./A.js";

type duck = {
  quack: () => string;
}

// These string types should confict with the imported types
var A: string = "Hello";
var Foo: string = "Goodbye";
var Baz: string = "Go away please";

// This string type should conflict with the typedef
var duck: string = "quack";
