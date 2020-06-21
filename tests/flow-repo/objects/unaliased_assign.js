/**
 * test handling of unaliased value assignment.
 *
 * An unaliased object rvalue may be assigned to a supertype lvalue,
 * because later widening mutations on the rvalue can't break assumptions
 * made by other lvalues.
 *
 * However, upon assignment the rvalue must take on the type of the
 * lvalue, to avoid both false positives and false negatives
 * (unsoundness), as shown below.
 *
 * @flow
 */

var glob: { x: string } = { x: "hey" };

function assign_then_alias() {
  var obj: { x: string | number };
  obj = { x: "hey" };
  glob = obj;    // error: subsequent assignment might make glob.x a number
}

function assign_then_widen() {
  var obj: { x: string | number };
  obj = { x: "hey" };
  obj.x = 10;  // ok, by lvalue's given type
}
