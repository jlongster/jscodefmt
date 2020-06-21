// @noflow

// nested intersections (see also lib/test23_lib.js)

type NestedObj = { } & { dummy: SomeLibClass };

type Obj = NestedObj & { x: string };

function foo(obj: Obj) {
  obj.x; // should be OK
  obj.x; // should also be OK (the check above shouldn't affect anything)
}
