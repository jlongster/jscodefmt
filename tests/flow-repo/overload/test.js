function foo() {
  var output = new FakeUint8Array();
  output.set(new FakeUint8Array(), 0); // matches one of the overloads of set
}
