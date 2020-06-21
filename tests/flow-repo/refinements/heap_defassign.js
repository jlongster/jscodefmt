// @flow

type Obj = { p: number | string }

function f () {}

function def_assign_function_havoc(obj: Obj) {
    obj.p = 10;                 // (obj.p : number)
    f();                        // clears refi
    var x: number = obj.p;      // error, obj.p : number | string
}

function def_assign_setprop_havoc(obj: Obj, obj2: Obj) {
    obj.p = 10;                 // (obj.p : number)
    obj2.p = 'hey';             // clears refi
    var x: number = obj.p;      // error, obj.p : number | string
}

function def_assign_index_havoc(obj: Obj, obj2: Obj) {
    obj.p = 10;                 // (obj.p : number)
    obj2['p'] = 'hey';          // clears refi
    var x: number = obj.p;      // error, obj.p : number | string
}

function def_assign_within_if(b: boolean, obj: Obj) {
    if (b) {
        obj.p = 10;             // (obj.p : number)
        var x: number = obj.p   // ok by def assign
    }
    var y: number = obj.p;      // error, obj.p : number | string
}

function def_assign_within_while(b: boolean, obj: Obj) {
    while (b) {
        obj.p = 10;             // (obj.p : number)
        var x: number = obj.p   // ok by def assign
    }
    var y: number = obj.p;      // error, obj.p : number | string
}

function def_assign_within_do(b: boolean, obj: Obj) {
    do {
        obj.p = 10;             // (obj.p : number)
        var x: number = obj.p   // ok by def assign
    } while (b);
    var y: number = obj.p;      // no error, loop runs at least once
}

function def_assign_within_try(b: boolean, obj: Obj) {
    obj.p = 10;                 // (obj.p : number)
    try {
        f();                    // clears refi and might throw
        obj.p = 'hey';
    } catch (e) {
        f();                    // clears refi and might throw
        obj.p = 'hey';
    } finally {
        // NOTE: the values understood to flow to obj.p at this point
        // include the number 42 written downstream;
        // so if we did y:string, we would get at least a spurious error
        // (among other reasonable errors caused by values written upstream)
        var y: number = obj.p;  // error, string ~/~ number
        obj.p = 42;
    }
    var z:string = obj.p;       // error, number ~/~ string
}

function def_assign_within_for(b: boolean, obj: Obj) {
    for (; b; ) {
        obj.p = 10;             // (obj.p : number)
        var x: number = obj.p   // ok by def assign
    }
    var z: number = obj.p;      // error, (number | string) ~/~ number
}

// --- name-sensitive havoc ---

type Obj2 = { q: number | string }

function def_assign_setprop_nohavoc(obj: Obj, obj2: Obj2) {
    obj.p = 10;                 // (obj.p : number)
    obj2.q = 'hey';             // doesn't clear refi of .p
    var x: number = obj.p;      // still ok
}
