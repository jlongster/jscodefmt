"use strict";
const getLast = require("../utils/get-last");

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

class AstPath {
  constructor(value) {
    this.stack = [value];
  }

  // The name of the current property is always the penultimate element of
  // this.stack, and always a String.
  getName() {
    const { stack } = this;
    const { length } = stack;
    if (length > 1) {
      return stack[length - 2];
    }
    // Since the name is always a string, null is a safe sentinel value to
    // return if we do not know the name of the (root) value.
    /* istanbul ignore next */
    return null;
  }

  // The value of the current property is always the final element of
  // this.stack.
  getValue() {
    return getLast(this.stack);
  }

  getNode(count = 0) {
    return getNodeHelper(this, count);
  }

  getParentNode(count = 0) {
    return getNodeHelper(this, count + 1);
  }

  // Temporarily push properties named by string arguments given after the
  // callback function onto this.stack, then call the callback with a
  // reference to this (modified) AstPath object. Note that the stack will
  // be restored to its original state after the callback is finished, so it
  // is probably a mistake to retain a reference to the path.
  call(callback, ...names) {
    const { stack } = this;
    const { length } = stack;
    let value = getLast(stack);

    for (const name of names) {
      value = value[name];
      stack.push(name, value);
    }
    const result = callback(this);
    stack.length = length;
    return result;
  }

  callParent(callback, count = 0) {
    const stackIndex = getNodeStackIndexHelper(this.stack, count + 1);
    const parentValues = this.stack.splice(stackIndex + 1);
    const result = callback(this);
    this.stack.push(...parentValues);
    return result;
  }

  // Similar to AstPath.prototype.call, except that the value obtained by
  // accessing this.getValue()[name1][name2]... should be array. The
  // callback will be called with a reference to this path object for each
  // element of the array.
  each(callback, ...names) {
    this.eachValue((element, index, value) => {
      callback(this, index, value);
    }, ...names);
  }

  // Similar to AstPath.prototype.each, except that the results of the
  // callback function invocations are stored in an array and returned at
  // the end of the iteration.
  map(callback, ...names) {
    const result = [];
    this.eachValue((element, index, value) => {
      result[index] = callback(this, index, value);
    }, ...names);
    return result;
  }

  // Similar to AstPath.prototype.each, except that first argument of the
  // callback function is value of the array
  eachValue(callback, ...names) {
    const { stack } = this;
    const { length } = stack;
    let value = getLast(stack);

    for (const name of names) {
      value = value[name];
      stack.push(name, value);
    }

    for (let index = 0; index < value.length; ++index) {
      const element = value[index];
      stack.push(index, element);
      callback(element, index, value);
      stack.length -= 2;
    }

    stack.length = length;
  }

  // Similar to AstPath.prototype.map, except that first argument of the
  // callback function is value of the array
  mapValue(callback, ...names) {
    const result = [];
    this.eachValue((element, index, value) => {
      result[index] = callback(element, index, value);
    }, ...names);
    return result;
  }

  /**
   * @param {...(
   *   | ((node: any, name: string | null, number: number | null) => boolean)
   *   | undefined
   * )} predicates
   */
  match(...predicates) {
    let stackPointer = this.stack.length - 1;

    let name = null;
    let node = this.stack[stackPointer--];

    for (const predicate of predicates) {
      /* istanbul ignore next */
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

      if (predicate && !predicate(node, name, number)) {
        return false;
      }

      name = this.stack[stackPointer--];
      node = this.stack[stackPointer--];
    }

    return true;
  }

  /**
   * Traverses the ancestors of the current node heading toward the tree root
   * until it finds a node that matches the provided predicate function. Will
   * return the first matching ancestor. If no such node exists, returns undefined.
   * @param {(node: any, name: string, number: number | null) => boolean} predicate
   * @internal Unstable API. Don't use in plugins for now.
   */
  findAncestor(predicate) {
    let stackPointer = this.stack.length - 1;

    let name = null;
    let node = this.stack[stackPointer--];

    while (node) {
      // skip index/array
      let number = null;
      if (typeof name === "number") {
        number = name;
        name = this.stack[stackPointer--];
        node = this.stack[stackPointer--];
      }

      if (name !== null && predicate(node, name, number)) {
        return node;
      }

      name = this.stack[stackPointer--];
      node = this.stack[stackPointer--];
    }
  }
}

module.exports = AstPath;
