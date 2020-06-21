declare class C { x: number; }

var x: string = new C().x;

interface I { x: number; }

var i = new I(); // error

function testInterfaceName(o: I) {
  (o.name: string); // error, name is static
  (o.constructor.name: string); // ok
}
