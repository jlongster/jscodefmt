var obj = {x: 0, m() { return this.x }}
var x: string = obj['m'](); // error, number ~> string

var arr = [function() { return this.length }];
var y: string = arr[0](); // error: number ~> string
