// @flow

function foo(x: ?string): $NonMaybeType<?string> {
  if (x != null) { return x; }
  else return 0; // this should be an error
}

//(foo(): string); // should not be necessary to expose the error above

(0: $NonMaybeType<null>); // error
(0: $NonMaybeType<?number>); // ok
(0: $NonMaybeType<number | null>); // ok
