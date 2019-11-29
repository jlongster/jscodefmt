run_spec(__dirname, ["js-all"], {
  singleQuote: false,
  jsxSingleQuote: false
});
run_spec(__dirname, ["js-all"], {
  singleQuote: false,
  jsxSingleQuote: true
});
run_spec(__dirname, ["js-all"], {
  singleQuote: true,
  jsxSingleQuote: false
});
run_spec(__dirname, ["js-all"], {
  singleQuote: true,
  jsxSingleQuote: true
});
