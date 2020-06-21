run_spec(__dirname, ["babel", "flow", "typescript"]);
run_spec(__dirname, ["babel", "flow", "typescript"], {
  htmlWhitespaceSensitivity: "ignore",
});
