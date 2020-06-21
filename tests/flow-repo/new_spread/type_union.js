declare class T {}
declare var x: T;

declare class U {}
declare var y: U;

type O1 = {...{p:T}|{q:U}};
declare var o1: O1;
(o1: {p?:T}|{q?:U}); // ok
