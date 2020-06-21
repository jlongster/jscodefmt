import { B, C } from "./issue-824-helper";

type K = B | C;

type I = {
  which(): number;
};

export default class A {
  static foo(p: K): bool {
    return false;
  }
  static bar(p: I & K): bool {
    return this.foo(p);
  }
}
