/* @flow */
type T = A|B;
class U {};
declare var children: U;
(children: T|U);
class A {};
class B {};

type VirtualElement = Thunk|VirtualNode;
type Child = VirtualElement;
type Children = Array<Child>;


class Thunk {}
class VirtualNode {
  children: Child|Children;
  constructor(type, children/*:Children*/) {
    this.children = children.length === 1 ? children[0] :
      children;
  }
}
