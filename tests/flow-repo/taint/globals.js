// @flow

class A {
  f(x : $Tainted<FakeLocation>) {
    fakeDocument.location = x; // error
    doStuff(x); // ok
  }
  f1(x : $Tainted<FakeLocation>) {
    // TODO(rcastano): should cause an error.
    window.fakeLocation = x;
  }
}
