// @flow

// Filter the contents of an array


declare function my_filter<T, P: $Pred<1>>(v: Array<T>, cb: P): Array<$Refine<T,P,1>>;

type A = { kind: 'A', u: number }
type B = { kind: 'B', v: string }
type C = { kind: 'C', y: boolean }
type D = { kind: 'D', x: boolean }
type E = { kind: 'E', y: boolean }

declare var ab: Array<A|B|C>;

(my_filter(ab, (x): %checks => x.kind === 'A'): Array<B>);    // ERROR
(my_filter(ab, (x): %checks => x.kind !== 'A'): Array<A|C>);  // ERROR
