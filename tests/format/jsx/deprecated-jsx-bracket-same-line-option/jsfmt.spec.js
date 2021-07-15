run_spec(__dirname, ["babel", "flow", "typescript"], {
  jsxBracketSameLine: true,
});
run_spec(__dirname, ["babel", "flow", "typescript"], {
  jsxBracketSameLine: false,
});
run_spec(__dirname, ["babel", "flow", "typescript"], {
  jsxBracketSameLine: false,
  bracketSameLine: true,
});
run_spec(__dirname, ["babel", "flow", "typescript"], {
  jsxBracketSameLine: true,
  bracketSameLine: false,
});
