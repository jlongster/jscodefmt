// @flow

// Sanity check: make sure the parameters are checked as usual

declare function foo(
  input: mixed,
  types: string | Array<string>
): boolean %checks(typeof input === "string" || Array.isArray(input));

foo(3, 3);
