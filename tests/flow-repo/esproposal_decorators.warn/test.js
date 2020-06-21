/* @flow */

@decorator4
class Foo {
  @decorator1
  method1() {}

  @decorator2
  @decorator3
  method2() {}
}
