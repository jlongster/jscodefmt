// @flow

function obj_pattern<X>({ prop } : { prop: X }) {} // prop: X
type Prop<X> = { prop: X };
function obj_pattern2<X>({ prop } : Prop<X>) {} // prop: X

function arr_pattern<X>([ elem ] : X[]) {} // elem: X
type Elem<X> = X[];
function arr_pattern2<X>([ elem ] : Elem<X>) {} // elem: X

function tup_pattern<X>([ proj ] : [X]) {} // proj: X
type Proj<X> = [X];
function tup_pattern2<X>([ proj ] : Proj<X>) {} // proj: X

function rest_pattern<X>(...r: X[]) {} // r: X[]

function obj_rest_pattern<X>({ _, ...o } : { _: any, x: X }) { // o: { x: X }
  o.x;
}
type ObjRest<X> = { _: any, x: X };
function obj_rest_pattern<X>({ _, ...o } : ObjRest<X>) { // o: { x: X }
  o.x;
}

function arr_rest_pattern<X>([ _, ...a ] : [ any, X ]) { // a: [X]
  a[0];
}
type ArrRest<X> = [ any, X ];
function arr_rest_pattern<X>([ _, ...a ] : ArrRest<X>) { // a: [X]
  a[0];
}
