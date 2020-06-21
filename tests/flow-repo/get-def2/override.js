// @flow

class C {
  override() { }
}

class D extends C {
  foo() { this.override() }
  bar() { this.override }
  override() { }
}
