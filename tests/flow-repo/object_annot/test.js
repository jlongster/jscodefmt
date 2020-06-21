function foo(x: Array<Object>): Array<Object> {
    return x.sort((a, b) => a.foo - b.foo);
}

// Make sure Object works with Object.keys()
function bar(x: Object): Array<string> {
  return Object.keys(x);
}
