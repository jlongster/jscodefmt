run_spec(__dirname, ["flow", "babel-flow"], {
  quoteProps: "as-needed",
});

run_spec(__dirname, ["flow", "babel-flow"], {
  quoteProps: "preserve",
});

run_spec(__dirname, ["flow", "babel-flow"], {
  quoteProps: "consistent",
});

run_spec(__dirname, ["flow", "babel-flow"], {
  quoteProps: "consistent",
  singleQuote: true,
});
