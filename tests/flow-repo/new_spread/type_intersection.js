declare class T {}
declare class U {}

declare class A {}
declare class B extends A {}

type O1 = {...{p:T}&{q:U}};
declare var o1: O1;
(o1: {p?:T,q?:U}); // ok

type O2 = {...{p:A}&{p:B}};
declare var o2: O2;
(o2: {p?:B}); // ok
({p: new B}: O2); // ok
({p: new A}: O2); // error: A ~> B

type O3 = {...{p:A}&{[string]:B}};
declare var o3: O3;
(o3: {p:B,[string]:B});// ok: A&B = B
(o3.q: B); // ok

type O4 = {...{[string]:A}&{p:B}};
declare var o4: O4;
(o4: {p:B,[string]:A}); // ok: A&B = B

type O5 = {...{[string]:A}&{[string]:B}};
declare var o5: O5;
(o5: {[string]:B}); // ok: A&B = B
