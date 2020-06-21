class A {+p: string|number}
class B extends A {p: number}

type O1 = {...B};
declare var o1: O1;
(o1: {p?:number}); // ok

declare class C {[string]:number}
type O2 = {...C};
declare var o2: O2;
(o2: {[string]:number}); // ok
