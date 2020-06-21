const fixtures = {
  dirname: __dirname,
  snippets: [
    "var a = { /* comment */      \nb };", // trailing whitespace after comment
    "var a = { /* comment */\nb };",
  ],
};

run_spec(fixtures, ["babel", "flow", "typescript"]);
run_spec(fixtures, ["babel", "flow", "typescript"], { semi: false });
