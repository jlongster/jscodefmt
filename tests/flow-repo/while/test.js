class C {
    m() { return new C; }
}
function blah() {}
var node: ?C = new C;
while (node) {
    var parent = node.m();
    var cloneable: C = node;
    blah();
    node = parent.m();
}
