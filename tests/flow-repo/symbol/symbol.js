declare var s: symbol;

// Creation
{
  const x: symbol = Symbol(); // OK
  const y: symbol = Symbol('bar'); // OK

  Symbol('foo', 'bar'); // Error: unused argument
}

// Properties and methods
{
  const x: string = s.toString(); // OK
  const y: ?symbol = s.valueOf(); // OK
  const z: string | void = s.description; // OK
}

// Refinement
{
  const x: symbol | boolean = true;
  if (typeof x === "symbol") {
    (x: symbol); // OK
    (x: boolean); // Error
  } else {
    (x: boolean); // OK
    (x: symbol); // Error
  }
}

// Well-known symbols
{
  (Symbol.hasInstance: symbol); // OK
  (Symbol.isConcatSpreadable: symbol); // OK
  (Symbol.match: symbol); // OK
  (Symbol.matchAll: symbol); // OK
  (Symbol.replace: symbol); // OK
  (Symbol.search: symbol); // OK
  (Symbol.species: symbol); // OK
  (Symbol.split: symbol); // OK
  (Symbol.toPrimitive: symbol); // OK
  (Symbol.toStringTag: symbol); // OK
  (Symbol.unscopables: symbol); // OK

  const x: $SymbolMatch = Symbol.match; // OK
  const y: $SymbolMatch = Symbol.toPrimitive; // Error
}

// Non-strict equality
{
  // Comparison with symbol is allowed
  const s: symbol = Symbol();
  const y: symbol = Symbol();
  s == y; // OK
  y == s; // OK
  s != y; // OK
  y != s; // OK
}
{
  const s: symbol = Symbol();
  // Cannot compare against non-symbols
  const x: [] = [];
  x == s; // Error
  s == x; // Error
  x != s; // Error
  s != x; // Error
}
{
  const s: symbol = Symbol();
  // Other than null/void which we always allow
  s == null; // OK
  null == s; // OK
  s == undefined; // OK
  undefined == s; // OK
}
