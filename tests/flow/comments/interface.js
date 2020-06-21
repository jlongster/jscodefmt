interface Foo {
  bar(
    currentRequest: {a: number},
    // TODO this is a very very very very long comment that makes it go > 80 columns
  ): number;
}
