type Foo = {
  field: number,
}

var x: {field?: number} = {};
var y: $Shape<Foo> = x;
(y.field: number)
