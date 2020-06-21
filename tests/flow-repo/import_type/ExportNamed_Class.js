/**
 * @flow
 */

class ClassFoo2 {
  returnsANumber(): number { return 42; }
}

export {ClassFoo2};
export var foo2Inst = new ClassFoo2();
