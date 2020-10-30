run_spec(__dirname, ["flow", "babel-flow", "babel"]);
run_spec(__dirname, ["flow", "babel-flow", "babel"], { trailingComma: "all" });
run_spec(__dirname, ["flow", "babel-flow", "babel"], { arrowParens: "avoid" });
