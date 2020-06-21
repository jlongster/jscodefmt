// @flow

function apply<Args: $ReadOnlyArray<mixed>, Ret>(
  fn: (...Args) => Ret,
  args: Args,
): Ret {
  return fn(...args);
}

function noRest(x: 'hi', y: 123): true { return true; }
apply(noRest, ['hi', 123]); // No error
apply(noRest, ['hi', 456]); // Error - 456 ~> 123
apply(noRest, ['hi']); // Error - too few args
apply(noRest, ['hi', 123, false]); // No error - too many args is fine

// withRest behaves the same as noRest except you can't pass too many args in
function withRest(...rest: ['hi', 123]): true { return true; }
apply(withRest, ['hi', 123]); // No error
apply(withRest, ['hi', 456]); // Error - 456 ~> 123
apply(withRest, ['hi']); // Error - too few args
apply(withRest, ['hi', 123, false]); // Error - too many args

// Same thing, but with types instead of functions
declare var applyType: <Args: $ReadOnlyArray<mixed>, Ret>(
  fn: (...Args) => Ret,
  args: Args,
) => Ret;

function noRest(x: 'hi', y: 123): true { return true; }
applyType(noRest, ['hi', 123]); // No error
applyType(noRest, ['hi', 456]); // Error - 456 ~> 123
applyType(noRest, ['hi']); // Error - too few args
applyType(noRest, ['hi', 123, false]); // No error - too many args is fine

// withRest behaves the same as noRest except you can't pass too many args in
function withRest(...rest: ['hi', 123]): true { return true; }
applyType(withRest, ['hi', 123]); // No error
applyType(withRest, ['hi', 456]); // Error - 456 ~> 123
applyType(withRest, ['hi']); // Error - too few args
applyType(withRest, ['hi', 123, false]); // Error - too many args
