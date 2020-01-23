"use strict";

const assert = require("assert");

function FastPath(value) {
  assert.ok(this instanceof FastPath);
  this.stack = [value];
}

// The name of the current property is always the penultimate element of
// this.stack, and always a String.
FastPath.prototype.getName = function getName() {
  const s = this.stack;
  const len = s.length;
  if (len > 1) {
    return s[len - 2];
  }
  // Since the name is always a string, null is a safe sentinel value to
  // return if we do not know the name of the (root) value.
  /* istanbul ignore next */
  return null;
};

// The value of the current property is always the final element of
// this.stack.
FastPath.prototype.getValue = function getValue() {
  const s = this.stack;
  return s[s.length - 1];
};

function getNodeHelper(path, count) {
  const stackIndex = getNodeStackIndexHelper(path.stack, count);
  return stackIndex === -1 ? null : path.stack[stackIndex];
}

function getNodeStackIndexHelper(stack, count) {
  for (let i = stack.length - 1; i >= 0; i -= 2) {
    const value = stack[i];
    if (value && !Array.isArray(value) && --count < 0) {
      return i;
    }
  }
  return -1;
}

FastPath.prototype.getNode = function getNode(count) {
  return getNodeHelper(this, ~~count);
};

FastPath.prototype.getParentNode = function getParentNode(count) {
  return getNodeHelper(this, ~~count + 1);
};

// Temporarily push properties named by string arguments given after the
// callback function onto this.stack, then call the callback with a
// reference to this (modified) FastPath object. Note that the stack will
// be restored to its original state after the callback is finished, so it
// is probably a mistake to retain a reference to the path.
FastPath.prototype.call = function call(callback, ...names) {
  const s = this.stack;
  const origLen = s.length;
  let value = s[origLen - 1];
  const argc = names.length;
  for (let i = 0; i < argc; ++i) {
    const name = names[i];
    value = value[name];
    s.push(name, value);
  }
  const result = callback(this);
  s.length = origLen;
  return result;
};

FastPath.prototype.callParent = function callParent(callback, count) {
  const stackIndex = getNodeStackIndexHelper(this.stack, ~~count + 1);
  const parentValues = this.stack.splice(stackIndex + 1);
  const result = callback(this);
  Array.prototype.push.apply(this.stack, parentValues);
  return result;
};

// Similar to FastPath.prototype.call, except that the value obtained by
// accessing this.getValue()[name1][name2]... should be array-like. The
// callback will be called with a reference to this path object for each
// element of the array.
FastPath.prototype.each = function each(callback, ...names) {
  const s = this.stack;
  const origLen = s.length;
  let value = s[origLen - 1];
  const argc = names.length;

  for (let i = 0; i < argc; ++i) {
    const name = names[i];
    value = value[name];
    s.push(name, value);
  }

  for (let i = 0; i < value.length; ++i) {
    if (i in value) {
      s.push(i, value[i]);
      // If the callback needs to know the value of i, call
      // path.getName(), assuming path is the parameter name.
      callback(this);
      s.length -= 2;
    }
  }

  s.length = origLen;
};

// Similar to FastPath.prototype.each, except that the results of the
// callback function invocations are stored in an array and returned at
// the end of the iteration.
FastPath.prototype.map = function map(callback, ...names) {
  const s = this.stack;
  const origLen = s.length;
  let value = s[origLen - 1];
  const argc = names.length;

  for (let i = 0; i < argc; ++i) {
    const name = names[i];
    value = value[name];
    s.push(name, value);
  }

  const result = new Array(value.length);

  for (let i = 0; i < value.length; ++i) {
    if (i in value) {
      s.push(i, value[i]);
      result[i] = callback(this, i);
      s.length -= 2;
    }
  }

  s.length = origLen;

  return result;
};

/**
 * @param {...(
 *   | ((node: any, name: string | null, number: number | null) => boolean)
 *   | undefined
 * )} predicates
 */
FastPath.prototype.match = function match(...predicates) {
  let stackPointer = this.stack.length - 1;

  let name = null;
  let node = this.stack[stackPointer--];

  for (let i = 0; i < predicates.length; ++i) {
    if (node === undefined) {
      return false;
    }

    // skip index/array
    let number = null;
    if (typeof name === "number") {
      number = name;
      name = this.stack[stackPointer--];
      node = this.stack[stackPointer--];
    }

    if (predicates[i] && !predicates[i](node, name, number)) {
      return false;
    }

    name = this.stack[stackPointer--];
    node = this.stack[stackPointer--];
  }

  return true;
};

module.exports = FastPath;
