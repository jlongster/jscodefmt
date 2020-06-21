interface I { foo(x: number): void; }
(function foo(x: number) { }: I); // error, property `foo` not found function

declare class C {
  bar(i: I): void;
  bar(f: (x: number) => void): void;
}

new C().bar((x: string) => { }); // error, number ~/~> string
