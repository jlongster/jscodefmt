var x: { } = { foo: 0 };
var y: { foo?: string } = x; // OK in TypeScript, not OK in Flow

var z: string = y.foo || "";

var o = { };
y = o; // OK; we know that narrowing could not have happened
o.foo = 0; // future widening is constrained

function bar(config: { foo?: number }) {}
bar({});
bar({foo: ""});
