run_spec(
  {
    dirname: __dirname,
    snippets: [
      "{foo}",
      '{["foo"]:"bar"}',
      '{"foo": ~1}',
      '{"foo": false || "bar"}',
      '{"foo": undefined}',
      '{"foo": () => {}}',
    ],
  },
  ["json-stringify"]
);
