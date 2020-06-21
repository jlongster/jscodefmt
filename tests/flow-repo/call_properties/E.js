// Expecting properties that don't exist should be an error
var a : { someProp: number } = function () {};

// Expecting properties that do exist should be fine
var b : { apply: Function } = function () {};

// Expecting properties in the functions statics should be fine
var f = function () {};
f.myProp = 123;
var c : { myProp: number } = f;
