type O1 = {...any};
var o1: O1 = (0: mixed); // ok
(o1: empty); // ok

type O2 = {...Object};
var o2: O2 = (0: mixed); // ok
(o2: empty); // ok

declare var Base: any;
declare class Derived extends Base {}
type O3 = {...Derived};
var o3: O3 = (0: mixed); // ok
(o3: empty) // ok
