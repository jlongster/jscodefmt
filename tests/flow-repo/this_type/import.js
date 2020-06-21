// Check that imports are handled properly with this types

import { A1 } from './export';
import type { A2 } from './export';
import { A3 } from './export';

class B1 extends A1 {
  foo(): B1 { return new B1(); } // error
}

(new B1().bar(): B1); // OK

class B3<X> extends A3<X> {
  foo(): B3<X> { return new B3(); } // error
}

(new B3().bar(): B3<*>); // OK
(new B3().qux(0): string); // error

(new B3().bar(): A2<*>); // OK
((new B3().bar(): B3<string>): A2<number>); // error
((new B3(): A2<number>).qux(0): string); // error
