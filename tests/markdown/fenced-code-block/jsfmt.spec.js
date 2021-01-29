run_spec(
  {
    dirname: __dirname,
    snippets: [
      "```\na",
      "```\na\n",
      "```\na\n\n",
      `\`\`\`\na${"\n".repeat(10)}`,
    ],
  },
  ["markdown"]
);
