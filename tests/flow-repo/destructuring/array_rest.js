let xs = [0, "", true];
let [a, ...ys] = xs;
let [b, ...zs] = ys;
let c = zs[0]; // retain tuple info
let d = zs[1]; // run off the end

(a: void); // error: number ~> void
(b: void); // error: string ~> void
(c: void); // error: boolean ~> void
(d: void); // error: number|string|boolean ~> void

let [...e] = 0;
