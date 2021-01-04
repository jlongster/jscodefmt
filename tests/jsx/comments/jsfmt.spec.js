run_spec(__dirname, ["flow", "babel", "typescript"], {
  angleBracketSameLine: true,
  errors: {
    typescript: ["in-end-tag.js"],
  },
});
