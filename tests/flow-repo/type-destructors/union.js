var x0: $NonMaybeType<number|string> = 0; // ok, number ~> number|string
var x1: $NonMaybeType<number|string> = true; // err, boolean ~> number|string
var x2: $PropertyType<{p:number}|{p:string},'p'> = 0; // ok, number ~> number|string
var x3: $PropertyType<{p:number}|{p:string},'p'> = true; // err, boolean ~> number|string
