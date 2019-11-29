run_spec(__dirname, ["babel-all", "flow"]);

// TODO: While the tests render the same, Flow is dropping the line breaks
// between each declaration while babel preserves them.
//run_spec(__dirname, null, ["babel"]);
