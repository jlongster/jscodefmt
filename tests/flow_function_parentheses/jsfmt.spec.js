run_spec(__dirname, ["babel-all", "flow"]);
run_spec(__dirname, ["babel-all", "flow"], { trailingComma: "all" });
run_spec(__dirname, ["babel-all", "flow"], { arrowParens: "always" });
