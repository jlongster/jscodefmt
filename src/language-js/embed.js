"use strict";

const { isBlockComment, hasLeadingComment } = require("./comments");

const {
  builders: {
    indent,
    join,
    line,
    hardline,
    softline,
    literalline,
    concat,
    group,
    dedentToRoot,
  },
  utils: { mapDoc, stripTrailingHardline },
} = require("../document");

function embed(path, print, textToDoc, options) {
  const node = path.getValue();
  const parent = path.getParentNode();
  const parentParent = path.getParentNode(1);

  switch (node.type) {
    case "TemplateLiteral": {
      const isCss = [
        isStyledJsx,
        isStyledComponents,
        isCssProp,
        isAngularComponentStyles,
      ].some((isIt) => isIt(path));

      if (isCss) {
        // Get full template literal with expressions replaced by placeholders
        const rawQuasis = node.quasis.map((q) => q.value.raw);
        let placeholderID = 0;
        const text = rawQuasis.reduce((prevVal, currVal, idx) => {
          return idx === 0
            ? currVal
            : prevVal +
                "@prettier-placeholder-" +
                placeholderID++ +
                "-id" +
                currVal;
        }, "");
        const doc = textToDoc(text, { parser: "scss" });
        return transformCssDoc(doc, path, print);
      }

      /*
       * react-relay and graphql-tag
       * graphql`...`
       * graphql.experimental`...`
       * gql`...`
       *
       * This intentionally excludes Relay Classic tags, as Prettier does not
       * support Relay Classic formatting.
       */
      if (isGraphQL(path)) {
        const expressionDocs = node.expressions
          ? path.map(print, "expressions")
          : [];

        const numQuasis = node.quasis.length;

        if (numQuasis === 1 && node.quasis[0].value.raw.trim() === "") {
          return "``";
        }

        const parts = [];

        for (let i = 0; i < numQuasis; i++) {
          const templateElement = node.quasis[i];
          const isFirst = i === 0;
          const isLast = i === numQuasis - 1;
          const text = templateElement.value.cooked;

          // Bail out if any of the quasis have an invalid escape sequence
          // (which would make the `cooked` value be `null` or `undefined`)
          if (typeof text !== "string") {
            return null;
          }

          const lines = text.split("\n");
          const numLines = lines.length;
          const expressionDoc = expressionDocs[i];

          const startsWithBlankLine =
            numLines > 2 && lines[0].trim() === "" && lines[1].trim() === "";
          const endsWithBlankLine =
            numLines > 2 &&
            lines[numLines - 1].trim() === "" &&
            lines[numLines - 2].trim() === "";

          const commentsAndWhitespaceOnly = lines.every((line) =>
            /^\s*(?:#[^\n\r]*)?$/.test(line)
          );

          // Bail out if an interpolation occurs within a comment.
          if (!isLast && /#[^\n\r]*$/.test(lines[numLines - 1])) {
            return null;
          }

          let doc = null;

          if (commentsAndWhitespaceOnly) {
            doc = printGraphqlComments(lines);
          } else {
            doc = stripTrailingHardline(textToDoc(text, { parser: "graphql" }));
          }

          if (doc) {
            doc = escapeTemplateCharacters(doc, false);
            if (!isFirst && startsWithBlankLine) {
              parts.push("");
            }
            parts.push(doc);
            if (!isLast && endsWithBlankLine) {
              parts.push("");
            }
          } else if (!isFirst && !isLast && startsWithBlankLine) {
            parts.push("");
          }

          if (expressionDoc) {
            parts.push(concat(["${", expressionDoc, "}"]));
          }
        }

        return concat([
          "`",
          indent(concat([hardline, join(hardline, parts)])),
          hardline,
          "`",
        ]);
      }

      const htmlParser = isHtml(path)
        ? "html"
        : isAngularComponentTemplate(path)
        ? "angular"
        : undefined;

      if (htmlParser) {
        return printHtmlTemplateLiteral(
          path,
          print,
          textToDoc,
          htmlParser,
          options
        );
      }

      break;
    }

    case "TemplateElement": {
      /**
       * md`...`
       * markdown`...`
       */
      if (
        parentParent &&
        parentParent.type === "TaggedTemplateExpression" &&
        parent.quasis.length === 1 &&
        parentParent.tag.type === "Identifier" &&
        (parentParent.tag.name === "md" || parentParent.tag.name === "markdown")
      ) {
        const text = parent.quasis[0].value.raw.replace(
          /((?:\\\\)*)\\`/g,
          (_, backslashes) => "\\".repeat(backslashes.length / 2) + "`"
        );
        const indentation = getIndentation(text);
        const hasIndent = indentation !== "";
        return concat([
          hasIndent
            ? indent(
                concat([
                  softline,
                  printMarkdown(
                    text.replace(new RegExp(`^${indentation}`, "gm"), "")
                  ),
                ])
              )
            : concat([literalline, dedentToRoot(printMarkdown(text))]),
          softline,
        ]);
      }

      break;
    }
  }

  function printMarkdown(text) {
    const doc = textToDoc(text, { parser: "markdown", __inJsTemplate: true });
    return stripTrailingHardline(escapeTemplateCharacters(doc, true));
  }
}

function getIndentation(str) {
  const firstMatchedIndent = str.match(/^([^\S\n]*)\S/m);
  return firstMatchedIndent === null ? "" : firstMatchedIndent[1];
}

function uncook(cookedValue) {
  return cookedValue.replace(/([\\`]|\${)/g, "\\$1");
}

function escapeTemplateCharacters(doc, raw) {
  return mapDoc(doc, (currentDoc) => {
    if (!currentDoc.parts) {
      return currentDoc;
    }

    const parts = [];

    currentDoc.parts.forEach((part) => {
      if (typeof part === "string") {
        parts.push(raw ? part.replace(/(\\*)`/g, "$1$1\\`") : uncook(part));
      } else {
        parts.push(part);
      }
    });

    return { ...currentDoc, parts };
  });
}

function transformCssDoc(quasisDoc, path, print) {
  const parentNode = path.getValue();

  const isEmpty =
    parentNode.quasis.length === 1 && !parentNode.quasis[0].value.raw.trim();
  if (isEmpty) {
    return "``";
  }

  const expressionDocs = parentNode.expressions
    ? path.map(print, "expressions")
    : [];
  const newDoc = replacePlaceholders(quasisDoc, expressionDocs);
  /* istanbul ignore if */
  if (!newDoc) {
    throw new Error("Couldn't insert all the expressions");
  }
  return concat([
    "`",
    indent(concat([hardline, stripTrailingHardline(newDoc)])),
    softline,
    "`",
  ]);
}

// Search all the placeholders in the quasisDoc tree
// and replace them with the expression docs one by one
// returns a new doc with all the placeholders replaced,
// or null if it couldn't replace any expression
function replacePlaceholders(quasisDoc, expressionDocs) {
  if (!expressionDocs || !expressionDocs.length) {
    return quasisDoc;
  }

  let replaceCounter = 0;
  const newDoc = mapDoc(quasisDoc, (doc) => {
    if (!doc || !doc.parts || !doc.parts.length) {
      return doc;
    }

    let { parts } = doc;
    const atIndex = parts.indexOf("@");
    const placeholderIndex = atIndex + 1;
    if (
      atIndex > -1 &&
      typeof parts[placeholderIndex] === "string" &&
      parts[placeholderIndex].startsWith("prettier-placeholder")
    ) {
      // If placeholder is split, join it
      const at = parts[atIndex];
      const placeholder = parts[placeholderIndex];
      const rest = parts.slice(placeholderIndex + 1);
      parts = parts
        .slice(0, atIndex)
        .concat([at + placeholder])
        .concat(rest);
    }

    const replacedParts = [];
    parts.forEach((part) => {
      if (typeof part !== "string" || !part.includes("@prettier-placeholder")) {
        replacedParts.push(part);
        return;
      }

      // When we have multiple placeholders in one line, like:
      // ${Child}${Child2}:not(:first-child)
      part.split(/@prettier-placeholder-(\d+)-id/).forEach((component, idx) => {
        // The placeholder is always at odd indices
        if (idx % 2 === 0) {
          replacedParts.push(component);
          return;
        }

        // The component will always be a number at odd index
        replacedParts.push("${", expressionDocs[component], "}");
        replaceCounter++;
      });
    });
    return { ...doc, parts: replacedParts };
  });
  return expressionDocs.length === replaceCounter ? newDoc : null;
}

function printGraphqlComments(lines) {
  const parts = [];
  let seenComment = false;

  lines
    .map((textLine) => textLine.trim())
    .forEach((textLine, i, array) => {
      // Lines are either whitespace only, or a comment (with potential whitespace
      // around it). Drop whitespace-only lines.
      if (textLine === "") {
        return;
      }

      if (array[i - 1] === "" && seenComment) {
        // If a non-first comment is preceded by a blank (whitespace only) line,
        // add in a blank line.
        parts.push(concat([hardline, textLine]));
      } else {
        parts.push(textLine);
      }

      seenComment = true;
    });

  // If `lines` was whitespace only, return `null`.
  return parts.length === 0 ? null : join(hardline, parts);
}

/**
 * Template literal in these contexts:
 * <style jsx>{`div{color:red}`}</style>
 * css``
 * css.global``
 * css.resolve``
 */
function isStyledJsx(path) {
  const node = path.getValue();
  const parent = path.getParentNode();
  const parentParent = path.getParentNode(1);
  return (
    (parentParent &&
      node.quasis &&
      parent.type === "JSXExpressionContainer" &&
      parentParent.type === "JSXElement" &&
      parentParent.openingElement.name.name === "style" &&
      parentParent.openingElement.attributes.some(
        (attribute) => attribute.name.name === "jsx"
      )) ||
    (parent &&
      parent.type === "TaggedTemplateExpression" &&
      parent.tag.type === "Identifier" &&
      parent.tag.name === "css") ||
    (parent &&
      parent.type === "TaggedTemplateExpression" &&
      parent.tag.type === "MemberExpression" &&
      parent.tag.object.name === "css" &&
      (parent.tag.property.name === "global" ||
        parent.tag.property.name === "resolve"))
  );
}

/**
 * Angular Components can have:
 * - Inline HTML template
 * - Inline CSS styles
 *
 * ...which are both within template literals somewhere
 * inside of the Component decorator factory.
 *
 * E.g.
 * @Component({
 *  template: `<div>...</div>`,
 *  styles: [`h1 { color: blue; }`]
 * })
 */
function isAngularComponentStyles(path) {
  return path.match(
    (node) => node.type === "TemplateLiteral",
    (node, name) => node.type === "ArrayExpression" && name === "elements",
    (node, name) =>
      (node.type === "Property" || node.type === "ObjectProperty") &&
      node.key.type === "Identifier" &&
      node.key.name === "styles" &&
      name === "value",
    ...angularComponentObjectExpressionPredicates
  );
}
function isAngularComponentTemplate(path) {
  return path.match(
    (node) => node.type === "TemplateLiteral",
    (node, name) =>
      (node.type === "Property" || node.type === "ObjectProperty") &&
      node.key.type === "Identifier" &&
      node.key.name === "template" &&
      name === "value",
    ...angularComponentObjectExpressionPredicates
  );
}
const angularComponentObjectExpressionPredicates = [
  (node, name) => node.type === "ObjectExpression" && name === "properties",
  (node, name) =>
    node.type === "CallExpression" &&
    node.callee.type === "Identifier" &&
    node.callee.name === "Component" &&
    name === "arguments",
  (node, name) => node.type === "Decorator" && name === "expression",
];

/**
 * styled-components template literals
 */
function isStyledComponents(path) {
  const parent = path.getParentNode();

  if (!parent || parent.type !== "TaggedTemplateExpression") {
    return false;
  }

  const { tag } = parent;

  switch (tag.type) {
    case "MemberExpression":
      return (
        // styled.foo``
        isStyledIdentifier(tag.object) ||
        // Component.extend``
        isStyledExtend(tag)
      );

    case "CallExpression":
      return (
        // styled(Component)``
        isStyledIdentifier(tag.callee) ||
        (tag.callee.type === "MemberExpression" &&
          ((tag.callee.object.type === "MemberExpression" &&
            // styled.foo.attrs({})``
            (isStyledIdentifier(tag.callee.object.object) ||
              // Component.extend.attrs({})``
              isStyledExtend(tag.callee.object))) ||
            // styled(Component).attrs({})``
            (tag.callee.object.type === "CallExpression" &&
              isStyledIdentifier(tag.callee.object.callee))))
      );

    case "Identifier":
      // css``
      return tag.name === "css";

    default:
      return false;
  }
}

/**
 * JSX element with CSS prop
 */
function isCssProp(path) {
  const parent = path.getParentNode();
  const parentParent = path.getParentNode(1);
  return (
    parentParent &&
    parent.type === "JSXExpressionContainer" &&
    parentParent.type === "JSXAttribute" &&
    parentParent.name.type === "JSXIdentifier" &&
    parentParent.name.name === "css"
  );
}

function isStyledIdentifier(node) {
  return node.type === "Identifier" && node.name === "styled";
}

function isStyledExtend(node) {
  return /^[A-Z]/.test(node.object.name) && node.property.name === "extend";
}

/*
 * react-relay and graphql-tag
 * graphql`...`
 * graphql.experimental`...`
 * gql`...`
 * GraphQL comment block
 *
 * This intentionally excludes Relay Classic tags, as Prettier does not
 * support Relay Classic formatting.
 */
function isGraphQL(path) {
  const node = path.getValue();
  const parent = path.getParentNode();

  return (
    hasLanguageComment(node, "GraphQL") ||
    (parent &&
      ((parent.type === "TaggedTemplateExpression" &&
        ((parent.tag.type === "MemberExpression" &&
          parent.tag.object.name === "graphql" &&
          parent.tag.property.name === "experimental") ||
          (parent.tag.type === "Identifier" &&
            (parent.tag.name === "gql" || parent.tag.name === "graphql")))) ||
        (parent.type === "CallExpression" &&
          parent.callee.type === "Identifier" &&
          parent.callee.name === "graphql")))
  );
}

function hasLanguageComment(node, languageName) {
  // This checks for a leading comment that is exactly `/* GraphQL */`
  // In order to be in line with other implementations of this comment tag
  // we will not trim the comment value and we will expect exactly one space on
  // either side of the GraphQL string
  // Also see ./clean.js
  return hasLeadingComment(
    node,
    (comment) =>
      isBlockComment(comment) && comment.value === ` ${languageName} `
  );
}

/**
 *     - html`...`
 *     - HTML comment block
 */
function isHtml(path) {
  return (
    hasLanguageComment(path.getValue(), "HTML") ||
    path.match(
      (node) => node.type === "TemplateLiteral",
      (node, name) =>
        node.type === "TaggedTemplateExpression" &&
        node.tag.type === "Identifier" &&
        node.tag.name === "html" &&
        name === "quasi"
    )
  );
}

// The counter is needed to distinguish nested embeds.
let htmlTemplateLiteralCounter = 0;

function printHtmlTemplateLiteral(path, print, textToDoc, parser, options) {
  const node = path.getValue();

  const counter = htmlTemplateLiteralCounter;
  htmlTemplateLiteralCounter = (htmlTemplateLiteralCounter + 1) >>> 0;

  const composePlaceholder = (index) =>
    `PRETTIER_HTML_PLACEHOLDER_${index}_${counter}_IN_JS`;

  const text = node.quasis
    .map((quasi, index, quasis) =>
      index === quasis.length - 1
        ? quasi.value.cooked
        : quasi.value.cooked + composePlaceholder(index)
    )
    .join("");

  const expressionDocs = path.map(print, "expressions");

  if (expressionDocs.length === 0 && text.trim().length === 0) {
    return "``";
  }

  const placeholderRegex = new RegExp(composePlaceholder("(\\d+)"), "g");
  let topLevelCount = 0;

  const contentDoc = mapDoc(
    stripTrailingHardline(
      textToDoc(text, {
        parser,
        __onHtmlRoot(root) {
          topLevelCount = root.children.length;
        },
      })
    ),
    (doc) => {
      if (typeof doc !== "string") {
        return doc;
      }

      const parts = [];

      const components = doc.split(placeholderRegex);
      for (let i = 0; i < components.length; i++) {
        let component = components[i];

        if (i % 2 === 0) {
          if (component) {
            component = uncook(component);
            if (options.embeddedInHtml) {
              component = component.replace(/<\/(script)\b/gi, "<\\/$1");
            }
            parts.push(component);
          }
          continue;
        }

        const placeholderIndex = +component;
        parts.push(
          concat(["${", group(expressionDocs[placeholderIndex]), "}"])
        );
      }

      return concat(parts);
    }
  );

  const leadingWhitespace = /^\s/.test(text) ? " " : "";
  const trailingWhitespace = /\s$/.test(text) ? " " : "";

  const linebreak =
    options.htmlWhitespaceSensitivity === "ignore"
      ? hardline
      : leadingWhitespace && trailingWhitespace
      ? line
      : null;

  if (linebreak) {
    return group(
      concat([
        "`",
        indent(concat([linebreak, group(contentDoc)])),
        linebreak,
        "`",
      ])
    );
  }

  return group(
    concat([
      "`",
      leadingWhitespace,
      topLevelCount > 1 ? indent(group(contentDoc)) : group(contentDoc),
      trailingWhitespace,
      "`",
    ])
  );
}

module.exports = embed;
