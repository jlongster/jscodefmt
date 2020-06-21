declare class C1 { static [[foo]]: T }
declare class C2 { [[foo]]: T }
interface T1 { [[foo]]: X }
interface T2 { [[foo]](): X }
type T3 = { [[foo]]: X }
type T4 = { [[foo]](): X }
type T5 = { [[foo]]?: X }
