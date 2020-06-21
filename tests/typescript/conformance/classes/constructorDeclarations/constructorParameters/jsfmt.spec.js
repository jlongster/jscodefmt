run_spec(__dirname, ["typescript"], {
  disableBabelTS: ["readonlyInConstructorParameters.ts", "readonlyReadonly.ts"],
});
