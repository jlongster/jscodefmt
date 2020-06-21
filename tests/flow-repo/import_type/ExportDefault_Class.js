/**
 * @flow
 */

class ClassFoo1 {
  returnsANumber(): number { return 42; }
}

export default ClassFoo1;
export var foo1Inst = new ClassFoo1();
