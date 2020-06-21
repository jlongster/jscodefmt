run_spec(__dirname, ["babel", "flow", "typescript"]);
run_spec(__dirname, ["babel", "flow", "typescript"], {
  trailingComma: "all",
});
run_spec(__dirname, ["babel", "flow", "typescript"], {
  arrowParens: "always",
});
