run_spec(
  {
    dirname: __dirname,
    snippets: [
      "let x1 = <div>}</div>;",
      "let x2 = <div>></div>;",
      'let x3 = <div>{"foo"}}</div>;',
      'let x4 = <div>{"foo"}></div>;',
      'let x5 = <div>}{"foo"}</div>;',
      'let x6 = <div>>{"foo"}</div>;',
    ],
  },
  ["typescript"]
);
