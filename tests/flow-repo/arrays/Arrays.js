
/* @providesModule Arrays */

function foo(x:string) { }

var a = [];
a[0] = 1;
a[1] = "...";

foo(a[1]);
var y;
a.forEach(x => y=x);

// for literals, composite element type is union of individuals
// note: test both tuple and non-tuple inferred literals
var alittle: Array<?number> = [0, 1, 2, 3, null];
var abig: Array<?number> = [0, 1, 2, 3, 4, 5, 6, 8, null];

var abig2: Array<{x:number; y:number}> = [
  {x:0, y:0},
  {x:0, y:0},
  {x:0, y:0},
  {x:0, y:0},
  {x:0, y:0},
  {x:0, y:0},
  {x:0, y:0},
  {x:0, y:0},
  {x:0, y:0},
  {x:0, y:0},
  {x:0, y:0},
  {x:0, y:0},
  {x:0, y:0},
  {x:0, y:0, a:true},
  {x:0, y:0, b:"hey"},
  {x:0, y:0, c:1},
  {x:0, y:0, c:"hey"}
];

module.exports = "arrays";
