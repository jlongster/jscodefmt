class P<X> { x: X; } // this is like Promise

type Pstar<X> = X | Pstar<P<X>>; // this is like Promise*

var p: P<number> = new P;
(p.x: string); // error

var pstar: Pstar<number> = 0; // OK
(pstar: number); // error, but limit potentially unbounded number of errors!
                 // e.g., P<number> ~/~ number, P<P<number>> ~/~ number, ...

pstar = p; // OK
(pstar.x: string); // error

pstar = (new P: P<P<number>>); // OK
(pstar.x: string); // error
