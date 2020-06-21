// @flow

// defs used in tests, here to stress tvar machinery

// used in ObjAssign.js
//
type ObjAssignT = { foo: string } & { bar: string };

// used in pred.js
//
type ReadableStreamOptions = {
  highWaterMark? : number,
  encoding? : ?string,
  objectMode? : boolean
};

type WritableStreamOptions = {
  highWaterMark? : number,
  decodeString? : boolean,
  objectMode? : boolean
};

// used in test_fun.js
//
type ObjA = { foo: number, bar: string };
type ObjB = { baz: bool };

// used in test_obj.js
//
type A = { a: string } & { b: string };
type B = { a: string, b: string };

type C = { [key: string]: number } & { [key: string]: number };
type D = { [key: string]: number };
