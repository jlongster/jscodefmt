/* @flow */

function obj_prop_fun({p:{q=0}={q:true}}={p:{q:""}}) {
  // errors:
  // * number  ~> void, from default on _.p.q
  // * boolean ~> void, from default on _.p
  // * string  ~> void, from default on _
  // * null    ~> void, from call below
  (q:void);
}
obj_prop_fun(); // ok
obj_prop_fun({}); // ok
obj_prop_fun({p:{}}); // ok
obj_prop_fun({p:{q:null}}); // ok, provides add'l lower bound

function obj_prop_var(o={p:{q:""}}) {
  var {p:{q=0}={q:true}} = o;
  // errors:
  // * number  ~> void, from default on o.p.q
  // * boolean ~> void, from default on o.p
  // * string  ~> void, from default on o
  // * null    ~> void, from call below
  (q:void);
}
obj_prop_var(); // ok
obj_prop_var({}); // ok
obj_prop_var({p:{}}); // ok
obj_prop_var({p:{q:null}}); // ok, provides add'l lower bound

function obj_rest({p:{q,...o}={q:0,r:0}}={p:{q:0,r:""}}) {
  // errors:
  // * number  ~> void, from default on _.p
  // * string  ~> void, from default on _
  // * null    ~> void, from call below
  (o.r:void);
}
obj_rest(); // ok
obj_rest({}); // ok
obj_rest({p:{}}); // ok
obj_rest({p:{q:0,r:null}});

function obj_prop_annot({
  p = true // error: boolean ~> string
}: {
  p: string
} = {
  p: 0 // error: number ~> string
}) {
  (p:void); // error: string ~> void
}

var {
  p = true // error: boolean ~> string
}: {
  p: string
} = {
  p: 0 // error: number ~> string
};
(p:void); // error: string ~> void

function obj_prop_err({x:{y}}=null) {} // error: property `x` cannot be accessed on null
function obj_rest_err({...o}=0) {} // error: expected object instead of number
function arr_elem_err([x]=null) {} // error: element 0 cannot be accessed on null
function arr_rest_err([...a]=null) {} // error: expected array instead of null

function gen<T>(x:T,{p=x}:{p:T}):T {
  return p;
}

// Default values in destructuring unwrap optional types
obj_prop_fun(({} : {p?:{q?:null}})); // ok
obj_prop_var(({} : {p?:{q?:null}})); // ok

// union-like upper bounds preserved through destructuring
function obj_prop_opt({p}:{p?:string}={p:0}) {}
function obj_prop_maybe({p}:{p:?string}={p:0}) {}
function obj_prop_union({p}:{p:number|string}={p:true}) {}

// TODO: union-of-objects upper bounds preserved through destructuring
function obj_prop_union2({p}:{p:number}|{p:string}={p:true}) {}

function default_expr_scope({a, b = a}) {}
