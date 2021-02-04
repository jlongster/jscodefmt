"use strict";

const { isBlockComment } = require("./utils");

const ignoredProperties = new Set([
  "range",
  "raw",
  "comments",
  "leadingComments",
  "trailingComments",
  "innerComments",
  "extra",
  "start",
  "end",
  "loc",
  "flags",
  "errors",
  "tokens",
]);

const removeTemplateElementsValue = (node) => {
  for (const templateElement of node.quasis) {
    delete templateElement.value;
  }
};

function clean(ast, newObj, parent) {
  if (ast.type === "Program") {
    delete newObj.sourceType;
  }

  if (
    (ast.type === "BigIntLiteral" ||
      ast.type === "BigIntLiteralTypeAnnotation") &&
    newObj.value
  ) {
    newObj.value = newObj.value.toLowerCase();
  }
  if (
    (ast.type === "BigIntLiteral" || ast.type === "Literal") &&
    newObj.bigint
  ) {
    newObj.bigint = newObj.bigint.toLowerCase();
  }

  if (ast.type === "DecimalLiteral") {
    newObj.value = Number(newObj.value);
  }

  // We remove extra `;` and add them when needed
  if (ast.type === "EmptyStatement") {
    return null;
  }

  // We move text around, including whitespaces and add {" "}
  if (ast.type === "JSXText") {
    return null;
  }
  if (
    ast.type === "JSXExpressionContainer" &&
    (ast.expression.type === "Literal" ||
      ast.expression.type === "StringLiteral") &&
    ast.expression.value === " "
  ) {
    return null;
  }

  // We change {'key': value} into {key: value}.
  // And {key: value} into {'key': value}.
  // Also for (some) number keys.
  if (
    (ast.type === "Property" ||
      ast.type === "ObjectProperty" ||
      ast.type === "MethodDefinition" ||
      ast.type === "ClassProperty" ||
      ast.type === "ClassMethod" ||
      ast.type === "PropertyDefinition" ||
      ast.type === "TSDeclareMethod" ||
      ast.type === "TSPropertySignature" ||
      ast.type === "ObjectTypeProperty") &&
    typeof ast.key === "object" &&
    ast.key &&
    (ast.key.type === "Literal" ||
      ast.key.type === "NumericLiteral" ||
      ast.key.type === "StringLiteral" ||
      ast.key.type === "Identifier")
  ) {
    delete newObj.key;
  }

  if (ast.type === "OptionalMemberExpression" && ast.optional === false) {
    newObj.type = "MemberExpression";
    delete newObj.optional;
  }

  // Remove raw and cooked values from TemplateElement when it's CSS
  // styled-jsx
  if (
    ast.type === "JSXElement" &&
    ast.openingElement.name.name === "style" &&
    ast.openingElement.attributes.some((attr) => attr.name.name === "jsx")
  ) {
    for (const { type, expression } of newObj.children) {
      if (
        type === "JSXExpressionContainer" &&
        expression.type === "TemplateLiteral"
      ) {
        removeTemplateElementsValue(expression);
      }
    }
  }

  // CSS template literals in css prop
  if (
    ast.type === "JSXAttribute" &&
    ast.name.name === "css" &&
    ast.value.type === "JSXExpressionContainer" &&
    ast.value.expression.type === "TemplateLiteral"
  ) {
    removeTemplateElementsValue(newObj.value.expression);
  }

  // We change quotes
  if (
    ast.type === "JSXAttribute" &&
    ast.value &&
    ast.value.type === "Literal" &&
    /["']|&quot;|&apos;/.test(ast.value.value)
  ) {
    newObj.value.value = newObj.value.value.replace(/["']|&quot;|&apos;/g, '"');
  }

  // Angular Components: Inline HTML template and Inline CSS styles
  const expression = ast.expression || ast.callee;
  if (
    ast.type === "Decorator" &&
    expression.type === "CallExpression" &&
    expression.callee.name === "Component" &&
    expression.arguments.length === 1
  ) {
    const astProps = ast.expression.arguments[0].properties;
    for (const [
      index,
      prop,
    ] of newObj.expression.arguments[0].properties.entries()) {
      switch (astProps[index].key.name) {
        case "styles":
          if (prop.value.type === "ArrayExpression") {
            removeTemplateElementsValue(prop.value.elements[0]);
          }
          break;
        case "template":
          if (prop.value.type === "TemplateLiteral") {
            removeTemplateElementsValue(prop.value);
          }
          break;
      }
    }
  }

  // styled-components, graphql, markdown
  if (
    ast.type === "TaggedTemplateExpression" &&
    (ast.tag.type === "MemberExpression" ||
      (ast.tag.type === "Identifier" &&
        (ast.tag.name === "gql" ||
          ast.tag.name === "graphql" ||
          ast.tag.name === "css" ||
          ast.tag.name === "md" ||
          ast.tag.name === "markdown" ||
          ast.tag.name === "html")) ||
      ast.tag.type === "CallExpression")
  ) {
    removeTemplateElementsValue(newObj.quasi);
  }
  if (ast.type === "TemplateLiteral") {
    // This checks for a leading comment that is exactly `/* GraphQL */`
    // In order to be in line with other implementations of this comment tag
    // we will not trim the comment value and we will expect exactly one space on
    // either side of the GraphQL string
    // Also see ./embed.js
    const hasLanguageComment =
      ast.leadingComments &&
      ast.leadingComments.some(
        (comment) =>
          isBlockComment(comment) &&
          ["GraphQL", "HTML"].some(
            (languageName) => comment.value === ` ${languageName} `
          )
      );
    if (
      hasLanguageComment ||
      (parent.type === "CallExpression" && parent.callee.name === "graphql") ||
      // TODO: check parser
      // `flow` and `typescript` don't have `leadingComments`
      !ast.leadingComments
    ) {
      removeTemplateElementsValue(newObj);
    }
  }

  if (ast.type === "InterpreterDirective") {
    newObj.value = newObj.value.trimEnd();
  }

  // TODO: Remove this when fixing #9760
  if (ast.type === "ClassMethod") {
    delete newObj.declare;
    delete newObj.readonly;
  }
}

clean.ignoredProperties = ignoredProperties;

module.exports = clean;
