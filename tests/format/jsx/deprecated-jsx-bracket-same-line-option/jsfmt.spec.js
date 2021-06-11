run_spec(__dirname, ["meriyah"], { jsxBracketSameLine: true });
run_spec(__dirname, ["meriyah"], { jsxBracketSameLine: false });
run_spec(__dirname, ["meriyah"], {
  jsxBracketSameLine: false,
  bracketSameLine: true,
});
run_spec(__dirname, ["meriyah"], {
  jsxBracketSameLine: true,
  bracketSameLine: false,
});
