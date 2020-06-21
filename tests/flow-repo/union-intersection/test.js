type A = {a: number};
type B = {b: number};
type C = {c: number};

type T1 = (A | B) & C;
function f1(x: T1): T1 { return x; }

type T2 = (A & B) | C;
function f2(x: T2): T2 { return x; }

type T3 = (A & C) | (B & C);
function f3(x: T3): T3 { return x; }

type T4 = (A | C) & (B | C);
function f4(x: T4): T4 { return x; }
