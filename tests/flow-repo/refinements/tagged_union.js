// example 1

type Type = Name | ListType;
type Name = {kind: 'Name', value: string};
type ListType = {kind: 'ListType', name: string};

function getTypeASTName(typeAST: Type): string {
  if (typeAST.kind === 'Name') {
    return typeAST.value; // OK, since typeAST: Name
  } else {
    return typeAST.name; // OK, since typeAST: ListType
  }
}

// example 2
import type {ASTNode} from './ast_node';
var Node = require('./node1'); // Node = "Node1"
function foo(x: ASTNode) {
  if (x.kind === Node) {
    return x.prop1.charAt(0); // typeAST: Node1, but x.prop1 may be undefined
  }
  return null;
}

// example 3
type Apple = { kind: 'Fruit', taste: 'Bad' }
type Orange = { kind: 'Fruit', taste: 'Good' }
type Broccoli = { kind: 'Veg', taste: 'Bad', raw: 'No' }
type Carrot = { kind: 'Veg', taste: 'Good', raw: 'Maybe' }

type Breakfast = Apple | Orange | Broccoli | Carrot

function bar(x: Breakfast) {
  if (x.kind === 'Fruit') { (x.taste: 'Good'); } // error, Apple.taste = Bad
  else (x.raw: 'No'); // error, Carrot.raw = Maybe
}

function qux(x: Breakfast) {
  if (x.taste === 'Good') {
    (x.raw: 'Yes' | 'No'); // 2 errors:
                           // Orange.raw doesn't exist
                           // Carrot.raw is neither Yes nor No
  }
}

// example 4
function list(n) {
  if (n > 0) return { kind: "cons", next: list(n-1) };
  return { kind: "nil" };
}
function length(l) {
  switch (l.kind) {
  case "cons": return 1 + length(l.next);
  default: return 0;
  }
}
function check(n) {
  if (n >= 0) return (n === (length(list(n))));
  return true;
}


// example 5
var EnumKind = { A: 1, B: 2, C: 3};
type A = { kind: 1, A: number };
type B = { kind: 2, B: number };
type C = { kind: 3, C: number };
function kind(x: A | B | C): number {
  switch (x.kind) {
  case EnumKind.A: return x.A;
  case EnumKind.B: return x.B;
  default: return x.A; // error, x: C and property A not found in type C
  }
}
kind({ kind: EnumKind.A, A: 1 });

// example 6
type Citizen = { citizen: true };
type NonCitizen = { citizen: false, nationality: string }
function nationality(x: Citizen | NonCitizen) {
  if (x.citizen) return "Shire"
  else return x.nationality;
}

let tests = [
  // non-existent props
  function test7(x: A) {
    if (x.kindTypo === 1) { // typos are allowed to be tested
      (x.kindTypo: string); // typos can't be used, though
    }
  },

  // nested objects
  function test8(x: {foo: {bar: 1}}) {
    if (x.foo.bar === 1) {}
    if (x.fooTypo.bar === 1) {} // error, fooTypo doesn't exist
  },

  // invalid RHS
  function(x: A) {
    if (x.kind === (null).toString()) {} // error, method on null
    if ({kind: 1}.kind === (null).toString()) {} // error, method on null
  },

  // non-objects on LHS
  function(
    x: Array<string>, y: string, z: number, q: boolean,
    r: Object, s: Function, t: () => void
  ) {
    if (x.length === 0) {}
    if (x.legnth === 0) { // typos are allowed to be tested
      (x.legnth: number); // inside the block, it's a number
      (x.legnth: string); // error: number literal 0 !~> string
    }
    if (y.length === 0) {}
    if (y.legnth === 0) { // typos are allowed to be tested
      (y.legnth: number); // inside the block, it's a number
      (y.legnth: string); // error: number literal 0 !~> string
    }
    if (z.toString === 0) {}
    if (z.toStirng === 0) { // typos are allowed to be tested
      (z.toStirng: number); // inside the block, it's a number
      (z.toStirng: string); // error: number literal 0 !~> string
    }
    if (q.valueOf === 0) {}
    if (q.valeuOf === 0) { // typos are allowed to be tested
      (q.valeuOf: number); // inside the block, it's a number
      (q.valeuOf: string); // error: number literal 0 !~> string
    }
    if (r.toStirng === 0) { // typos are allowed to be tested
      (r.toStirng: empty); // props on AnyObjT are `any`
    }
    if (s.call === 0) {}
    if (s.calll === 0) { // typos are allowed to be tested
      (t.calll: empty); // ok, props on functions are `any` :/
    }
    if (t.call === 0) {}
    if (t.calll === 0) { // typos are allowed to be tested
      (t.calll: empty); // ok, props on functions are `any` :/
    }
  },

  // sentinel props become the RHS
  function(x: { str: string, num: number, bool: boolean }) {
    if (x.str === 'str') {
      (x.str: 'not str'); // error: 'str' !~> 'not str'
    }
    if (x.num === 123) {
      (x.num: 456); // error: 123 !~> 456
    }
    if (x.bool === true) {
      (x.bool: false); // error: true !~> false
    }
    // even if it doesn't exist...
    if (x.badStr === 'bad') {
      (x.badStr: empty); // error: 'bad' !~> empty
    }
    if (x.badNum === 123) {
      (x.badNum: empty); // error: 123 !~> empty
    }
    if (x.badBool === true) {
      (x.badBool: empty); // error: true !~> empty
    }
  },

  // type mismatch
  function(x: { foo: 123, y: string } | { foo: 'foo', z: string }) {
    if (x.foo === 123) {
      (x.y: string);
      x.z; // error
    } else {
      (x.z: string);
      x.y; // error
    }
    if (x.foo === 'foo') {
      (x.z: string);
      x.y; // error
    } else {
      (x.y: string);
      x.z; // error
    }
  },

  // type mismatch, but one is not a literal
  function(x: { foo: number, y: string } | { foo: 'foo', z: string }) {
    if (x.foo === 123) {
      (x.y: string); // ok, because 123 !== 'foo'
      x.z; // error
    } else {
      x.y; // error: x.foo could be a string
      x.z; // error: could still be either case (if foo was a different number)
    }

    if (x.foo === 'foo') {
      (x.z: string);
      x.y; // error
    } else {
      (x.y: string);
      x.z; // error
    }
  },

  // type mismatch, neither is a literal
  function(x: { foo: number, y: string } | { foo: string, z: string }) {
    if (x.foo === 123) {
      (x.y: string); // ok, because 123 !== string
      x.z; // error
    } else {
      x.y; // error: x.foo could be a string
      x.z; // error: could still be either case (if foo was a different number)
    }

    if (x.foo === 'foo') {
      (x.z: string);
      x.y; // error
    } else {
      x.y; // error: x.foo could be a different string
      x.z; // error: x.foo could be a number
    }
  },

  // type mismatch, neither is a literal, test is not a literal either
  function(
    x: { foo: number, y: string } | { foo: string, z: string },
    num: number
  ) {
    if (x.foo === num) {
      x.y; // error: flow isn't smart enough to figure this out yet
      x.z; // error
    }
  },

  // null
  function(x: { foo: null, y: string } | { foo: 'foo', z: string }) {
    if (x.foo === null) {
      (x.y: string);
      x.z; // error
    } else {
      (x.z: string);
      x.y; // error
    }
    if (x.foo === 'foo') {
      (x.z: string);
      x.y; // error
    } else {
      (x.y: string);
      x.z; // error
    }
  },

  // void
  function(x: { foo: void, y: string } | { foo: 'foo', z: string }) {
    if (x.foo === undefined) {
      (x.y: string);
      x.z; // error
    } else {
      (x.z: string);
      x.y; // error
    }
    if (x.foo === 'foo') {
      (x.z: string);
      x.y; // error
    } else {
      (x.y: string);
      x.z; // error
    }
  },
];
