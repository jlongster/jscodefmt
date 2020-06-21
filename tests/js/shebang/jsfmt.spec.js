run_spec(
  {
    dirname: __dirname,
    snippets: [
      {
        name: "Empty file with shebang",
        code: "#!/usr/bin/env node",
      },
      {
        name: "Empty file with shebang",
        code: "#!/usr/bin/env node\n",
      },
    ],
  },
  ["babel", "flow", "typescript"]
);
