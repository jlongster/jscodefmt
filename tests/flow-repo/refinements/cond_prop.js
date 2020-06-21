/* @flow */

type Type = Name | ListType | NonNullType;
type Name = {kind: 'Name', value: string, type: void };
type ListType = {kind: 'ListType', type: Type};
type NonNullType = {kind: 'NonNullType', type: Name | ListType | BadType};
type BadType = {};

function getTypeASTName(typeAST: Type): string {
  if (!typeAST.type) throw new Error('Must be wrapping type'); // OK
  return getTypeASTName(typeAST.type); // error, BadType not a subtype of Type
}

let tests = [
  function(x: { done: true, result: string } | { done: false }) {
    if (x.done) {
      return x.result;
    }
    return x.result; // error
  },

  function(x: { done: true, result: string } | { foo: string }) {
    if (x.done) {
      return x.result; // error, consider { foo: "herp", done: "derp" }
    }
    return x.result; // error
  },

  function() {
    type T
      = { foo: Object, bar: string }
      | { baz: string, quux: string }

    function testAlwaysTruthyProp(t: T) {
      if (t.foo) {
        (t.bar: string); // error, consider { baz: "x", quux: "y", foo: "boom" }
      } else {
        (t.quux: string); // ok. since foo is an object (always truthy), the
                          // else case completely rules out the first branch of
                          // the union.
      }
    }

    function testSometimesTruthyProp(t: T) {
      if (t.bar) {
        (t.foo: Object); // error, consider { baz: "x", quux: "y", bar: "boom" }
      } else {
        (t.quux: string); // error, consider { foo: {}, bar: "" }
      }
    }
  },
]
