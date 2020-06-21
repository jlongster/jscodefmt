/* This test ensures that the code below does not take a long time to check. If
 * this test is taking a very long time to complete, there is a bug. */

class A {}

type B<T> = A & {
  +a: () => B<T>;
  +b: () => B<T>;
  +c: () => B<T>;
  +d: () => B<T>;
  +e: () => B<T>;
  +f: () => B<T>;
  +g: () => B<T>;
  +h: () => B<T>;
  +i: () => B<T>;
};

declare var b: B<any>;

(b: B<any>);
