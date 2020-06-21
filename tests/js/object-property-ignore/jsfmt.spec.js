const parser = ["babel", "flow", "typescript"];

run_spec(__dirname, parser /*, { trailingComma: "es5" }*/);
run_spec(__dirname, parser, { trailingComma: "none" });
run_spec(__dirname, parser, { trailingComma: "all" });
