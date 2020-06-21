// flow-parser@0.38.0 fails to parse `1.e1`, so use babel here.
run_spec(__dirname, ["babel", "typescript"]);
