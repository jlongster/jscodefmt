/**
 * @flow
 */

export type AliasFoo3  = {
  givesANum(): number
};
export function givesAFoo3Obj(): AliasFoo3 {
  return {
    givesANum(): number { return 42; }
  };
};
