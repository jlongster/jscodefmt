import type { J } from './import';
interface K { }
interface L extends J, K { y: string }

function foo(l: L) { l.x; l.y; l.z; } // error: z not found in L

// interface + multiple inheritance is similar to object type + intersection
type M = { y: string } & J & { z: boolean }

function bar(m: M) { m.x; m.y; m.z; } // OK
