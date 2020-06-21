type Foo = Promise<
  { ok: true, bar: string, baz: SomeOtherLongType } | 
  { ok: false, bar: SomeOtherLongType }
>;
