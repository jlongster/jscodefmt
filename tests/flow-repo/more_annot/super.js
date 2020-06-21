class C { m() { } }
class D extends C { }

var d: { +m: () => void } = new D();
