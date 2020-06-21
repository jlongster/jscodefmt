interface Interface {
  // prettier-ignore
  prop: type
  // prettier-ignore
  prop: type;
  prop: type;
}

// Last element
interface Interface {
  // prettier-ignore
  prop: type
  prop: type
}

interface foo extends bar {
  // prettier-ignore
  f(): void;
  // prettier-ignore
  g(): void;
  h(): void;
}

interface T<T> {
  // prettier-ignore
  new<T>(): T<T>;
  new<T>(): T<T>;
}
