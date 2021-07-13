"use strict";

const { isNonEmptyArray } = require("../common/util");
const colorAdjusterFunctions = new Set([
  "red",
  "green",
  "blue",
  "alpha",
  "a",
  "rgb",
  "hue",
  "h",
  "saturation",
  "s",
  "lightness",
  "l",
  "whiteness",
  "w",
  "blackness",
  "b",
  "tint",
  "shade",
  "blend",
  "blenda",
  "contrast",
  "hsl",
  "hsla",
  "hwb",
  "hwba",
]);

function getAncestorCounter(path, typeOrTypes) {
  const types = Array.isArray(typeOrTypes) ? typeOrTypes : [typeOrTypes];

  let counter = -1;
  let ancestorNode;

  while ((ancestorNode = path.getParentNode(++counter))) {
    if (types.includes(ancestorNode.type)) {
      return counter;
    }
  }

  return -1;
}

function getAncestorNode(path, typeOrTypes) {
  const counter = getAncestorCounter(path, typeOrTypes);
  return counter === -1 ? null : path.getParentNode(counter);
}

function getPropOfDeclNode(path) {
  const declAncestorNode = getAncestorNode(path, "css-decl");

  return (
    declAncestorNode &&
    declAncestorNode.prop &&
    declAncestorNode.prop.toLowerCase()
  );
}

function hasSCSSInterpolation(groupList) {
  if (isNonEmptyArray(groupList)) {
    for (let i = groupList.length - 1; i > 0; i--) {
      // If we find `#{`, return true.
      if (
        groupList[i].type === "word" &&
        groupList[i].value === "{" &&
        groupList[i - 1].type === "word" &&
        groupList[i - 1].value.endsWith("#")
      ) {
        return true;
      }
    }
  }
  return false;
}

function hasStringOrFunction(groupList) {
  if (isNonEmptyArray(groupList)) {
    for (let i = 0; i < groupList.length; i++) {
      if (groupList[i].type === "string" || groupList[i].type === "func") {
        return true;
      }
    }
  }
  return false;
}

function isSCSS(parser, text) {
  const hasExplicitParserChoice = parser === "less" || parser === "scss";
  const IS_POSSIBLY_SCSS = /(?:\w\s*:\s*[^:}]+|#){|@import[^\n]+(?:url|,)/;
  return hasExplicitParserChoice
    ? parser === "scss"
    : IS_POSSIBLY_SCSS.test(text);
}

function isSCSSVariable(node) {
  return Boolean(node && node.type === "word" && node.value.startsWith("$"));
}

function isWideKeywords(value) {
  return ["initial", "inherit", "unset", "revert"].includes(
    value.toLowerCase()
  );
}

function isKeyframeAtRuleKeywords(path, value) {
  const atRuleAncestorNode = getAncestorNode(path, "css-atrule");
  return (
    atRuleAncestorNode &&
    atRuleAncestorNode.name &&
    atRuleAncestorNode.name.toLowerCase().endsWith("keyframes") &&
    ["from", "to"].includes(value.toLowerCase())
  );
}

function maybeToLowerCase(value) {
  return value.includes("$") ||
    value.includes("@") ||
    value.includes("#") ||
    value.startsWith("%") ||
    value.startsWith("--") ||
    value.startsWith(":--") ||
    (value.includes("(") && value.includes(")"))
    ? value
    : value.toLowerCase();
}

function insideValueFunctionNode(path, functionName) {
  const funcAncestorNode = getAncestorNode(path, "value-func");
  return (
    funcAncestorNode &&
    funcAncestorNode.value &&
    funcAncestorNode.value.toLowerCase() === functionName
  );
}

function insideICSSRuleNode(path) {
  const ruleAncestorNode = getAncestorNode(path, "css-rule");

  return (
    ruleAncestorNode &&
    ruleAncestorNode.raws &&
    ruleAncestorNode.raws.selector &&
    (ruleAncestorNode.raws.selector.startsWith(":import") ||
      ruleAncestorNode.raws.selector.startsWith(":export"))
  );
}

function insideAtRuleNode(path, atRuleNameOrAtRuleNames) {
  const atRuleNames = Array.isArray(atRuleNameOrAtRuleNames)
    ? atRuleNameOrAtRuleNames
    : [atRuleNameOrAtRuleNames];
  const atRuleAncestorNode = getAncestorNode(path, "css-atrule");

  return (
    atRuleAncestorNode &&
    atRuleNames.includes(atRuleAncestorNode.name.toLowerCase())
  );
}

function insideURLFunctionInImportAtRuleNode(path) {
  const node = path.getValue();
  const atRuleAncestorNode = getAncestorNode(path, "css-atrule");

  return (
    atRuleAncestorNode &&
    atRuleAncestorNode.name === "import" &&
    node.groups[0].value === "url" &&
    node.groups.length === 2
  );
}

function isURLFunctionNode(node) {
  return node.type === "value-func" && node.value.toLowerCase() === "url";
}

function isLastNode(path, node) {
  const parentNode = path.getParentNode();

  /* istanbul ignore next */
  if (!parentNode) {
    return false;
  }
  const { nodes } = parentNode;
  return nodes && nodes.indexOf(node) === nodes.length - 1;
}

function isDetachedRulesetDeclarationNode(node) {
  // If a Less file ends up being parsed with the SCSS parser, Less
  // variable declarations will be parsed as atrules with names ending
  // with a colon, so keep the original case then.
  /* istanbul ignore next */
  if (!node.selector) {
    return false;
  }

  return (
    (typeof node.selector === "string" && /^@.+:.*$/.test(node.selector)) ||
    (node.selector.value && /^@.+:.*$/.test(node.selector.value))
  );
}

function isForKeywordNode(node) {
  return (
    node.type === "value-word" &&
    ["from", "through", "end"].includes(node.value)
  );
}

function isIfElseKeywordNode(node) {
  return (
    node.type === "value-word" && ["and", "or", "not"].includes(node.value)
  );
}

function isEachKeywordNode(node) {
  return node.type === "value-word" && node.value === "in";
}

function isMultiplicationNode(node) {
  return node.type === "value-operator" && node.value === "*";
}

function isDivisionNode(node) {
  return node.type === "value-operator" && node.value === "/";
}

function isAdditionNode(node) {
  return node.type === "value-operator" && node.value === "+";
}

function isSubtractionNode(node) {
  return node.type === "value-operator" && node.value === "-";
}

function isModuloNode(node) {
  return node.type === "value-operator" && node.value === "%";
}

function isMathOperatorNode(node) {
  return (
    isMultiplicationNode(node) ||
    isDivisionNode(node) ||
    isAdditionNode(node) ||
    isSubtractionNode(node) ||
    isModuloNode(node)
  );
}

function isEqualityOperatorNode(node) {
  return node.type === "value-word" && ["==", "!="].includes(node.value);
}

function isRelationalOperatorNode(node) {
  return (
    node.type === "value-word" && ["<", ">", "<=", ">="].includes(node.value)
  );
}

function isSCSSControlDirectiveNode(node) {
  return (
    node.type === "css-atrule" &&
    ["if", "else", "for", "each", "while"].includes(node.name)
  );
}

function isSCSSNestedPropertyNode(node) {
  /* istanbul ignore next */
  if (!node.selector) {
    return false;
  }

  return node.selector
    .replace(/\/\*.*?\*\//, "")
    .replace(/\/\/.*?\n/, "")
    .trim()
    .endsWith(":");
}

function isDetachedRulesetCallNode(node) {
  return node.raws && node.raws.params && /^\(\s*\)$/.test(node.raws.params);
}

function isTemplatePlaceholderNode(node) {
  return node.name.startsWith("prettier-placeholder");
}

function isTemplatePropNode(node) {
  return node.prop.startsWith("@prettier-placeholder");
}

function isPostcssSimpleVarNode(currentNode, nextNode) {
  return (
    currentNode.value === "$$" &&
    currentNode.type === "value-func" &&
    nextNode &&
    nextNode.type === "value-word" &&
    !nextNode.raws.before
  );
}

function hasComposesNode(node) {
  return (
    node.value &&
    node.value.type === "value-root" &&
    node.value.group &&
    node.value.group.type === "value-value" &&
    node.prop.toLowerCase() === "composes"
  );
}

function hasParensAroundNode(node) {
  return (
    node.value &&
    node.value.group &&
    node.value.group.group &&
    node.value.group.group.type === "value-paren_group" &&
    node.value.group.group.open !== null &&
    node.value.group.group.close !== null
  );
}

function hasEmptyRawBefore(node) {
  return node.raws && node.raws.before === "";
}

function isKeyValuePairNode(node) {
  return (
    node.type === "value-comma_group" &&
    node.groups &&
    node.groups[1] &&
    node.groups[1].type === "value-colon"
  );
}

function isKeyValuePairInParenGroupNode(node) {
  return (
    node.type === "value-paren_group" &&
    node.groups &&
    node.groups[0] &&
    isKeyValuePairNode(node.groups[0])
  );
}

function isSCSSMapItemNode(path) {
  const node = path.getValue();

  // Ignore empty item (i.e. `$key: ()`)
  if (node.groups.length === 0) {
    return false;
  }

  const parentParentNode = path.getParentNode(1);

  // Check open parens contain key/value pair (i.e. `(key: value)` and `(key: (value, other-value)`)
  if (
    !isKeyValuePairInParenGroupNode(node) &&
    !(parentParentNode && isKeyValuePairInParenGroupNode(parentParentNode))
  ) {
    return false;
  }

  const declNode = getAncestorNode(path, "css-decl");

  // SCSS map declaration (i.e. `$map: (key: value, other-key: other-value)`)
  if (declNode && declNode.prop && declNode.prop.startsWith("$")) {
    return true;
  }

  // List as value of key inside SCSS map (i.e. `$map: (key: (value other-value other-other-value))`)
  if (isKeyValuePairInParenGroupNode(parentParentNode)) {
    return true;
  }

  // SCSS Map is argument of function (i.e. `func((key: value, other-key: other-value))`)
  if (parentParentNode.type === "value-func") {
    return true;
  }

  return false;
}

function isInlineValueCommentNode(node) {
  return node.type === "value-comment" && node.inline;
}

function isHashNode(node) {
  return node.type === "value-word" && node.value === "#";
}

function isLeftCurlyBraceNode(node) {
  return node.type === "value-word" && node.value === "{";
}

function isRightCurlyBraceNode(node) {
  return node.type === "value-word" && node.value === "}";
}

function isWordNode(node) {
  return ["value-word", "value-atword"].includes(node.type);
}

function isColonNode(node) {
  return node && node.type === "value-colon";
}

function isKeyInValuePairNode(node, parentNode) {
  if (!isKeyValuePairNode(parentNode)) {
    return false;
  }

  const { groups } = parentNode;
  const index = groups.indexOf(node);

  if (index === -1) {
    return false;
  }

  return isColonNode(groups[index + 1]);
}

function isMediaAndSupportsKeywords(node) {
  return node.value && ["not", "and", "or"].includes(node.value.toLowerCase());
}

function isColorAdjusterFuncNode(node) {
  if (node.type !== "value-func") {
    return false;
  }

  return colorAdjusterFunctions.has(node.value.toLowerCase());
}

// TODO: only check `less` when we don't use `less` to parse `css`
function isLessParser(options) {
  return options.parser === "css" || options.parser === "less";
}

function lastLineHasInlineComment(text) {
  return /\/\//.test(text.split(/[\n\r]/).pop());
}

function stringifyNode(node) {
  if (node.groups) {
    const open = node.open && node.open.value ? node.open.value : "";
    const groups = node.groups.reduce(
      (previousValue, currentValue, index) =>
        previousValue +
        stringifyNode(currentValue) +
        (node.groups[0].type === "comma_group" &&
        index !== node.groups.length - 1
          ? ","
          : ""),
      ""
    );
    const close = node.close && node.close.value ? node.close.value : "";

    return open + groups + close;
  }

  const before = node.raws && node.raws.before ? node.raws.before : "";
  const quote = node.raws && node.raws.quote ? node.raws.quote : "";
  const atword = node.type === "atword" ? "@" : "";
  const value = node.value ? node.value : "";
  const unit = node.unit ? node.unit : "";
  const group = node.group ? stringifyNode(node.group) : "";
  const after = node.raws && node.raws.after ? node.raws.after : "";

  return before + quote + atword + value + quote + unit + group + after;
}

function isAtWordPlaceholderNode(node) {
  return (
    node &&
    node.type === "value-atword" &&
    node.value.startsWith("prettier-placeholder-")
  );
}

module.exports = {
  getAncestorCounter,
  getAncestorNode,
  getPropOfDeclNode,
  hasSCSSInterpolation,
  hasStringOrFunction,
  maybeToLowerCase,
  insideValueFunctionNode,
  insideICSSRuleNode,
  insideAtRuleNode,
  insideURLFunctionInImportAtRuleNode,
  isKeyframeAtRuleKeywords,
  isWideKeywords,
  isSCSS,
  isSCSSVariable,
  isLastNode,
  isLessParser,
  isSCSSControlDirectiveNode,
  isDetachedRulesetDeclarationNode,
  isRelationalOperatorNode,
  isEqualityOperatorNode,
  isMultiplicationNode,
  isDivisionNode,
  isAdditionNode,
  isSubtractionNode,
  isModuloNode,
  isMathOperatorNode,
  isEachKeywordNode,
  isForKeywordNode,
  isURLFunctionNode,
  isIfElseKeywordNode,
  hasComposesNode,
  hasParensAroundNode,
  hasEmptyRawBefore,
  isSCSSNestedPropertyNode,
  isDetachedRulesetCallNode,
  isTemplatePlaceholderNode,
  isTemplatePropNode,
  isPostcssSimpleVarNode,
  isKeyValuePairNode,
  isKeyValuePairInParenGroupNode,
  isKeyInValuePairNode,
  isSCSSMapItemNode,
  isInlineValueCommentNode,
  isHashNode,
  isLeftCurlyBraceNode,
  isRightCurlyBraceNode,
  isWordNode,
  isColonNode,
  isMediaAndSupportsKeywords,
  isColorAdjusterFuncNode,
  lastLineHasInlineComment,
  stringifyNode,
  isAtWordPlaceholderNode,
};
