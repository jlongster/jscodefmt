// @noflow

// method overloads

declare class C {
  m(x: number): void;
  m(x: string): void;
}

function f() { return 0; }

new C().m(f());
