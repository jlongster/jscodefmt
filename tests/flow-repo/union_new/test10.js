// @noflow

function id<X>(x: X): X { return x; }

/////////////////////////
// primitive annotations
/////////////////////////

function check_prim(_: number | string) { }

// ok
check_prim("");

// ...even when they "flow" in
check_prim(id(""));

//////////////////////////////
// class instance annotations
//////////////////////////////

class C { }
class D { }
function check_inst(_: C | D) { }

// ok
check_inst(new D);

// ...even when they "flow" in
check_inst(id(new C));

////////////////////////
// function annotations
////////////////////////

function check_fun(_: ((_: number) => number) | ((_: string) => string)) { }

// help!
check_fun((x) => x);

//////////////////////
// object annotations
//////////////////////

function check_obj(_: { x: number } | { x: string }) { }

// ok
check_obj({ x: "" });

// help!
check_obj({ x: id("") });

/////////////////////
// array annotations
/////////////////////

function check_arr(_: number[] | string[]) { }

// help! (unlike objects, array literals' element types are always open)
check_arr([""]);

// help!
check_arr([id("")]);

//////////////////////////////////////
// generic class instance annotations
//////////////////////////////////////

class P<X> { }
function check_poly_inst(_: P<number> | P<string>) { }

// help!
check_poly_inst(new P);
