/**
 * @flow
 */

class ClassFoo3 {
  givesANum(): number { return 42; }
  static givesAFoo3(): ClassFoo3 {
    return new ClassFoo3();
  }
}

module.exports = ClassFoo3;
