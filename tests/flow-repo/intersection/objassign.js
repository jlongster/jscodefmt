/**
 * Test intersection of objects flowing to spread assignment.
 *
 * Definitions in lib/lib.js
 *
 * @noflow
 */

declare var x: ObjAssignT;

let y: ObjAssignT = { ...x }; // should be fine
