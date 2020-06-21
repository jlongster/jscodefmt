// @noflow

// annotations for disjoint unions

type T =
  | { type: "FOO", x: number }
  | { type: "BAR", x: string }

({ type: (bar(): "BAR"), x: str() }: T);

({ type: bar(), x: str() }: T);

({ type: bar(), x: (str(): string) }: T);

function bar() {
  return "BAR";
}

function str() {
  return "hello";
}
