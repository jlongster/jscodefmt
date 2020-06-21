type I<X> = () => I<I<X>>;
type J<X> = () => J<J<X>>;

function foo(x: I<number>): J<number> {
  return x; // terminate despite expanding types, OK
  // I<number> and J<number> both expand to () => () => ...
}

type Q<X> = { x: X; }
type P<X> = () => Q<P<X>>;

function bar(x: P<number>): () => P<number> {
  return x; // terminate despite expanding types, error
  // P<number> = () => { x: P<number> }
  // () => P<number> = () => () => { x: P<number> }
}
