/* This test ensures that the code below does not take a long time to check. If
 * this test is taking a very long time to complete, there is a bug. */

class A {}

type B<T> = A & {
  +a: (x: B<T>) => void;
  +b: (x: B<T>) => void;
  +c: (x: B<T>) => void;
  +d: (x: B<T>) => void;
  +e: (x: B<T>) => void;
  +f: (x: B<T>) => void;
  +g: (x: B<T>) => void;
  +h: (x: B<T>) => void;
  +i: (x: B<T>) => void;
};

declare var b: B<any>;

(b: B<any>);
