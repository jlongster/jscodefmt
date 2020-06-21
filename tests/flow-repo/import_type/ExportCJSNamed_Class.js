/**
 * @flow
 */

class ClassFoo4 {
  returnsANumber(): number { return 42; }
}

class ClassFoo5 {}

function givesAFoo4(): ClassFoo4 {
  return new ClassFoo4();
}

function givesAFoo5(): ClassFoo5 {
  return new ClassFoo5();
}

exports.ClassFoo4 = ClassFoo4;
exports.ClassFoo5 = ClassFoo5
exports.foo4Inst = new ClassFoo4();
exports.foo5Inst = new ClassFoo5();
