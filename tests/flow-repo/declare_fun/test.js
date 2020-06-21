declare function foo(x: number): string;
declare function foo(x: string): number;
declare function foo<X>(x: X): X;

(foo(0): string); // OK
(foo("hello"): number); // OK
(foo(false): void); // error, boolean ~/~ undefined
