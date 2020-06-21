run_spec(__dirname, ["typescript"], {
  disableBabelTS: [
    "downlevelLetConst1.ts",
    "errorOnInitializerInInterfaceProperty.ts",
    "modifiersOnInterfaceIndexSignature1.ts",
  ],
});
