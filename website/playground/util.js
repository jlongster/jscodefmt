export function fixPrettierVersion(version) {
  const match = version.match(/^\d+\.\d+\.\d+-pr.(\d+)$/);
  if (match) {
    return `pr-${match[1]}`;
  }
  return version;
}

export function getDefaults(availableOptions, optionNames) {
  const defaults = {};
  for (const option of availableOptions) {
    if (optionNames.includes(option.name)) {
      defaults[option.name] =
        option.name === "parser" ? "babel" : option.default;
    }
  }
  return defaults;
}

export function buildCliArgs(availableOptions, options) {
  const args = [];
  for (const option of availableOptions) {
    const value = options[option.name];

    if (typeof value === "undefined") {
      continue;
    }

    if (option.type === "boolean") {
      if ((value && !option.inverted) || (!value && option.inverted)) {
        args.push([option.cliName, true]);
      }
    } else if (value !== option.default || option.name === "rangeStart") {
      args.push([option.cliName, value]);
    }
  }
  return args;
}

export function getCodemirrorMode(parser) {
  switch (parser) {
    case "css":
    case "less":
    case "scss":
      return "css";
    case "graphql":
      return "graphql";
    case "markdown":
      return "markdown";
    default:
      return "jsx";
  }
}

const astAutoFold = {
  estree: /^\s*"(loc|start|end)":/,
  postcss: /^\s*"(source|input|raws|file)":/,
  html: /^\s*"(sourceSpan|valueSpan|nameSpan|startSourceSpan|endSourceSpan|tagDefinition)":/,
  mdast: /^\s*"position":/,
  yaml: /^\s*"position":/,
  glimmer: /^\s*"loc":/,
};

export function getAstAutoFold(parser) {
  switch (parser) {
    case "flow":
    case "babel":
    case "babel-flow":
    case "babel-ts":
    case "typescript":
    case "json":
    case "json5":
    case "json-stringify":
      return astAutoFold.estree;
    case "css":
    case "less":
    case "scss":
      return astAutoFold.postcss;
    case "html":
    case "angular":
    case "vue":
    case "lwc":
      return astAutoFold.html;
    case "markdown":
    case "mdx":
      return astAutoFold.mdast;
    case "yaml":
      return astAutoFold.yaml;
    case "glimmer":
      return astAutoFold.glimmer;
  }
}
