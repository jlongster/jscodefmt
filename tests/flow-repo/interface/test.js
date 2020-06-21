interface I { y: string }
interface I_ { x: number }
interface J extends I, I_ { }
interface K extends J { }

var k: K = { x: "", y: "" }; // error: x should be number
(k.x: string); // error: x is number
(k.y: string);

declare class C { x: number }

interface A<Y> { y: Y }
interface A_<X> { x: X }
interface B<Z> extends A<string>, A_<Z> { z: Z }
interface E<Z> extends B<Z> { }

var e: E<number> = { x: "", y: "", z: "" }; // error: x and z should be numbers
(e.x: string); // error: x is number
(e.y: string);
(e.z: string); // error: z is number
