run_spec(__dirname, ["flow", "babel", "typescript"], {
  bracketSameLine: true,
  errors: {
    typescript: ["in-end-tag.js"],
  },
});
