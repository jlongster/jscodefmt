function formatMarkdown({
  input,
  output,
  output2,
  doc,
  version,
  url,
  options,
  cliOptions,
  full,
}) {
  const syntax = getMarkdownSyntax(options);
  const optionsString = formatCLIOptions(cliOptions);
  const isIdempotent = !output2 || output === output2;

  return [
    `**Prettier ${version}**`,
    `[Playground link](${url})`,
    optionsString === "" ? null : codeBlock(optionsString, "sh"),
    "",
    "**Input:**",
    codeBlock(input, syntax),
    ...(doc ? ["", "**Doc:**", codeBlock(doc, "js")] : []),
    ...(output === undefined
      ? []
      : ["", "**Output:**", codeBlock(output, syntax)]),
    ...(isIdempotent
      ? []
      : ["", "**Second Output:**", codeBlock(output2, syntax)]),
    ...(full ? ["", "**Expected behavior:**", ""] : []),
  ]
    .filter((part) => part !== null)
    .join("\n");
}

function getMarkdownSyntax(options) {
  switch (options.parser) {
    case "babel":
    case "babel-flow":
    case "flow":
    case "espree":
    case "meriyah":
    case "doc-explorer":
      return "jsx";
    case "babel-ts":
    case "typescript":
      return "tsx";
    case "json":
    case "json-stringify":
      return "jsonc";
    case "glimmer":
      return "hbs";
    case "angular":
    case "lwc":
      return "html";
    default:
      return options.parser;
  }
}

function formatCLIOptions(cliOptions) {
  return cliOptions
    .map(([name, value]) => (value === true ? name : `${name} ${value}`))
    .join("\n");
}

function codeBlock(content, syntax) {
  const backtickSequences = content.match(/`+/g) || [];
  const longestBacktickSequenceLength = Math.max(
    ...backtickSequences.map(({ length }) => length)
  );
  const prettierIgnoreComment = "<!-- prettier-ignore -->";
  const fenceLength = Math.max(3, longestBacktickSequenceLength + 1);
  const fence = "`".repeat(fenceLength);
  return [prettierIgnoreComment, fence + (syntax || ""), content, fence].join(
    "\n"
  );
}

module.exports = formatMarkdown;
