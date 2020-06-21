// @flow

let [x, y] = [1, 2];

/**
 * Test what happens when the destructuring is unevaluated. In this case,
 * `this` in a function is unbound, so we never actually find out the type of
 * `this.returnsATuple()` is; thus, we never evaluate `b` and so type-at-pos
 * returns EmptyT.
 */
export const X = {
  returnsATuple: function(): [number, number] {
    return [1, 2];
  },

  test: function() {
    let [a, b] = this.returnsATuple();
  }
};
