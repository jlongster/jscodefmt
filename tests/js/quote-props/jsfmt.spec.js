run_spec(__dirname, ["babel"], {
  quoteProps: "as-needed",
});

run_spec(__dirname, ["babel"], {
  quoteProps: "preserve",
});

run_spec(__dirname, ["babel"], {
  quoteProps: "consistent",
});

run_spec(__dirname, ["babel"], {
  quoteProps: "consistent",
  singleQuote: true,
});
