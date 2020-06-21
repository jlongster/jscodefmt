var o1 = { x: 0 };
var s1: string = o1.y; // error

var o2: { x: number; y?: string; } = { x: 0 };
var s2: string = o2.y || ""; // ok

var o3: { x: number; y?: string; } = ({ x: 0, y: 0 }: { x: number; });
var s3: string = o3.y || ""; // error

var o4: { x: number; y?: string; } = ({ x: 0 }: { x: number; [_:any]:any});
var s4: string = o4.y || ""; // ok

var o5 = { x: 0, ...{} };
var s5: string = o5.y; // ok (spreads make object types extensible)

var o6: { x: number; [_:any]:any } = { x: 0 };
var s6: string = o6.y; // ok  (indexers make object types extensible)

var o7: { x: number; y?: string; } = ({ x: 0, y: 0 }: { x: number; [_:any]:number}); // error
