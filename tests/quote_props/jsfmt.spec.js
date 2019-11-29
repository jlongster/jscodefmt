run_spec(__dirname, ["babel-all", "flow"], {
  quoteProps: "as-needed"
});

run_spec(__dirname, ["babel-all", "flow"], {
  quoteProps: "preserve"
});

run_spec(__dirname, ["babel-all", "flow"], {
  quoteProps: "consistent"
});
run_spec(__dirname, ["babel-all", "flow"], {
  quoteProps: "consistent",
  singleQuote: true
});
