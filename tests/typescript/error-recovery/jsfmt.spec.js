run_spec(__dirname, ["typescript"], {
  disableBabelTS: ["jsdoc_only_types.ts", "index-signature.ts"],
});
run_spec(__dirname, ["typescript"], {
  trailingComma: "es5",
  disableBabelTS: ["jsdoc_only_types.ts", "index-signature.ts"],
});
run_spec(__dirname, ["typescript"], {
  trailingComma: "all",
  disableBabelTS: ["jsdoc_only_types.ts", "index-signature.ts"],
});
