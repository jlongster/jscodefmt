declare class Foo {
  bar(x: 'hmm'): number;
  bar(x: string): string;
}
var foo = new Foo;
(foo.bar('hmm'): number); // OK
(foo.bar('hmmm'): number); // error
