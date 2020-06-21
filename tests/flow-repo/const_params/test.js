/**
 * test handling of const params
 * - reassignment prohibited
 * - durable refinements
 *
 * Currently gated in .flowconfig:
 *
 * [options]
 * experimental.const_params
 *
 * Syntax to follow
 *
 * @flow
 */

function cannot_reassign(x: string) {
  x = "hey"; // error, const param cannot be reassigned
}

// Note: const params use the same machinery as explicit
// const bindings, which are tested more extensively elsewhere.
// Here we're just making sure the machinery is hooked up.
//
function durable_refi(x: ?number) {
  if (x) {
    // ok: if x is truthy here, it's truthy everywhere
    return () => { var y:number = x; };
  }
}
