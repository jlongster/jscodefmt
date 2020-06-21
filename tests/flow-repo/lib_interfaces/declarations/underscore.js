interface C<T> {
  foo(): CArrays<T>;
  bar(): C<any>;
}
interface CArrays<T> extends C<Array<T>> {
  bar(): C<any>;
}
