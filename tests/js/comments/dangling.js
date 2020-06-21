var a = {/* dangling */};
var b = {
  // dangling
};
var b = [/* dangling */];
function d() {
  /* dangling */
}
new Thing(/* dangling */);
Thing(/* dangling */);
Thing?.(/* dangling */);
declare class Foo extends Qux<string> {/* dangling */}
export /* dangling */{};
