/* @flow */

class C {
  static p: string;
}
C.p = "hi";

// Class static fields are compatible with object types
(C: {p:string}); // ok
(C: {p:number}); // errors, string ~> number & vice versa (unify)

declare var o: {p:number};
(o: Class<C>); // error, object type incompatible with class type
