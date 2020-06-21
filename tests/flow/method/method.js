type T = { method: () => void };
type T2 = { method(): void };
declare class X { method(): void }
declare function f(): void;
var f: () => void;

declare class X {
  static deserialize(): mixed,
  static deserialize: () => mixed,
}

interface I {
  static(): number;
}
