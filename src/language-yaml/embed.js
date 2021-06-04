"use strict";

function embed(path, print, textToDoc, options) {
  const node = path.getValue();

  // If YAML is a Kubernetes resource use doNotIndent style for sequence in mappings.
  if (
    node.type === "document" &&
    node.body &&
    node.body.content &&
    node.body.content.type === "mapping"  &&
    node.body.content.children
  ) {
    const rootKeys = node.body.content.children.map(m => m.key && m.key.content && m.key.content.value)
    if (rootKeys.includes("apiVersion") && rootKeys.includes("kind")) {
      options.doNotIndent = true;
    }
  }

  // Try to format `.prettierrc` and `.stylelintrc` as `json` first
  if (
    node.type === "root" &&
    options.filepath &&
    /(?:[/\\]|^)\.(?:prettier|stylelint)rc$/.test(options.filepath)
  ) {
    return textToDoc(options.originalText, { ...options, parser: "json" });
  }
}

module.exports = embed;
