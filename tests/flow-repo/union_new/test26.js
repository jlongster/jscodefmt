// @noflow

declare function foo(x: number): number;
declare function foo(x: string): string;

declare var x: number | string;

(foo(x): number | string);

type T = number | string;
declare var y: T;

(foo(y): T);

declare class Record {
  set(x: 'foo', y: number): void;
  set(x: 'bar', y: string): void;
}

new Record().set('foo', "42");
