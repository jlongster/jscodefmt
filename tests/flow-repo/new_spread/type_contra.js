declare class T {};

type O1 = {...{-p:T}};
declare var o1: O1;
(o1: {p?:mixed}); // ok
(o1: {p?:T}); // error: unknown ~> T
(o1.p: T); // errors: undefined ~> T, unknown ~> T

type O2 = {...{-[string]:T}};
declare var o2: O2;
(o2: {[string]:mixed}); // ok
(o2: {[string]:T}); // error: unknown ~> T
(o2.p: T); // errors: unknown ~> T
