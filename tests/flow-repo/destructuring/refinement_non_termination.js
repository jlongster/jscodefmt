// @flow

function _([argArray]: Array<Value>) {
  if (argArray instanceof NullValue || argArray instanceof UndefinedValue) {
  }
};

class Value { }
class NullValue extends Value { }
class UndefinedValue extends Value { }
