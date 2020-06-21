run_spec(__dirname, ["markdown"], { proseWrap: "always" });
run_spec(__dirname, ["markdown"], { proseWrap: "always", tabWidth: 4 });
run_spec(__dirname, ["markdown"], { proseWrap: "always", tabWidth: 999 });
run_spec(__dirname, ["markdown"], { proseWrap: "always", tabWidth: 0 });
