/* @flow */
function foo(x?: string): string {
    if (x == null) { return 'foo'; }
    return x;
}

function bar(obj: {x?: string}): string {
    if (obj.x == null) { return 'foo'; }
    return obj.x;
}

function baz(bar?) {
    if (!bar) { return 1; }
    return bar.duck
}

function testOptionalNullable(x?: ?string): string {
    if (x == null) { return 'foo'; }
    return x;
}

function testOptionalNullableDefault(x?: ?string = "hi"): string {
    if (x == null) { return 'foo'; }
    return x;
}

function testOptionalNullableProperty(obj: {x?: ?string}): string {
    if (obj.x == null) { return 'foo'; }
    return obj.x;
}

function testOptionalNullableFlowingToNullable(x?: ?string): ?string {
  var f = function(y: ?string) {};
  f(x);
}
