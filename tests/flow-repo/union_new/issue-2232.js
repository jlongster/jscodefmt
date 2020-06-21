/* @flow */

declare type Entity<T> = {
  id: T,
  name: string
}

declare type StringEntity = Entity<string>


declare type Foo = StringEntity & {
  bars: Object,
  kind: 1
}
declare type EmptyFoo = StringEntity &  {
  bars: null,
  kind: 2
}

function test(f: Foo| EmptyFoo) {
  if (f.kind === 1) {
    (f: Foo)
  }
}
