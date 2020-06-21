var o = require('./proto');

o.z = 0;
var x:string = o.x;

var Bar = require('./function');
var a = new Bar(234);
a.x = 123;
a.y = 'abc'; // error, needs to be declared in Bar's constructor
(a.getX(): number);
(a.getY(): string);
