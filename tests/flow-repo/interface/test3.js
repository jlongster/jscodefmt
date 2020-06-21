interface I { x: number, y : string }
interface J { y : number }
interface K extends I, J { x: string } // error: x is number in I
function foo(k: K) {
  (k.x: number); // error: x is string in K
  (k.y: number); // error: y is string in I
}
