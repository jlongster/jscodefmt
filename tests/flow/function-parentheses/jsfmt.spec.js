run_spec(__dirname, ["flow", "babel"]);
run_spec(__dirname, ["flow", "babel"], { trailingComma: "all" });
run_spec(__dirname, ["flow", "babel"], { arrowParens: "avoid" });
