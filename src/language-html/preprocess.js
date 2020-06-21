"use strict";

const {
  htmlTrim,
  getLeadingAndTrailingHtmlWhitespace,
  hasHtmlWhitespace,
  canHaveInterpolation,
  getNodeCssStyleDisplay,
  isDanglingSpaceSensitiveNode,
  isIndentationSensitiveNode,
  isLeadingSpaceSensitiveNode,
  isTrailingSpaceSensitiveNode,
  isWhitespaceSensitiveNode,
} = require("./utils");

const PREPROCESS_PIPELINE = [
  removeIgnorableFirstLf,
  mergeIeConditonalStartEndCommentIntoElementOpeningTag,
  mergeCdataIntoText,
  extractInterpolation,
  extractWhitespaces,
  addCssDisplay,
  addIsSelfClosing,
  addHasHtmComponentClosingTag,
  addIsSpaceSensitive,
  mergeSimpleElementIntoText,
];

function preprocess(ast, options) {
  for (const fn of PREPROCESS_PIPELINE) {
    ast = fn(ast, options);
  }
  return ast;
}

function removeIgnorableFirstLf(ast /*, options */) {
  return ast.map((node) => {
    if (
      node.type === "element" &&
      node.tagDefinition.ignoreFirstLf &&
      node.children.length !== 0 &&
      node.children[0].type === "text" &&
      node.children[0].value[0] === "\n"
    ) {
      const [text, ...rest] = node.children;
      return node.clone({
        children:
          text.value.length === 1
            ? rest
            : [text.clone({ value: text.value.slice(1) }), ...rest],
      });
    }
    return node;
  });
}

function mergeIeConditonalStartEndCommentIntoElementOpeningTag(
  ast /*, options */
) {
  /**
   *     <!--[if ...]><!--><target><!--<![endif]-->
   */
  const isTarget = (node) =>
    node.type === "element" &&
    node.prev &&
    node.prev.type === "ieConditionalStartComment" &&
    node.prev.sourceSpan.end.offset === node.startSourceSpan.start.offset &&
    node.firstChild &&
    node.firstChild.type === "ieConditionalEndComment" &&
    node.firstChild.sourceSpan.start.offset === node.startSourceSpan.end.offset;
  return ast.map((node) => {
    if (node.children) {
      const isTargetResults = node.children.map(isTarget);
      if (isTargetResults.some(Boolean)) {
        const newChildren = [];

        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];

          if (isTargetResults[i + 1]) {
            // ieConditionalStartComment
            continue;
          }

          if (isTargetResults[i]) {
            const ieConditionalStartComment = child.prev;
            const ieConditionalEndComment = child.firstChild;

            const ParseSourceSpan = child.sourceSpan.constructor;
            const startSourceSpan = new ParseSourceSpan(
              ieConditionalStartComment.sourceSpan.start,
              ieConditionalEndComment.sourceSpan.end
            );
            const sourceSpan = new ParseSourceSpan(
              startSourceSpan.start,
              child.sourceSpan.end
            );

            newChildren.push(
              child.clone({
                condition: ieConditionalStartComment.condition,
                sourceSpan,
                startSourceSpan,
                children: child.children.slice(1),
              })
            );

            continue;
          }

          newChildren.push(child);
        }

        return node.clone({ children: newChildren });
      }
    }
    return node;
  });
}

function mergeNodeIntoText(ast, shouldMerge, getValue) {
  return ast.map((node) => {
    if (node.children) {
      const shouldMergeResults = node.children.map(shouldMerge);
      if (shouldMergeResults.some(Boolean)) {
        const newChildren = [];
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];

          if (child.type !== "text" && !shouldMergeResults[i]) {
            newChildren.push(child);
            continue;
          }

          const newChild =
            child.type === "text"
              ? child
              : child.clone({ type: "text", value: getValue(child) });

          if (
            newChildren.length === 0 ||
            newChildren[newChildren.length - 1].type !== "text"
          ) {
            newChildren.push(newChild);
            continue;
          }

          const lastChild = newChildren.pop();
          const ParseSourceSpan = lastChild.sourceSpan.constructor;
          newChildren.push(
            lastChild.clone({
              value: lastChild.value + newChild.value,
              sourceSpan: new ParseSourceSpan(
                lastChild.sourceSpan.start,
                newChild.sourceSpan.end
              ),
            })
          );
        }
        return node.clone({ children: newChildren });
      }
    }

    return node;
  });
}

function mergeCdataIntoText(ast /*, options */) {
  return mergeNodeIntoText(
    ast,
    (node) => node.type === "cdata",
    (node) => `<![CDATA[${node.value}]]>`
  );
}

function mergeSimpleElementIntoText(ast /*, options */) {
  const isSimpleElement = (node) =>
    node.type === "element" &&
    node.attrs.length === 0 &&
    node.children.length === 1 &&
    node.firstChild.type === "text" &&
    !hasHtmlWhitespace(node.children[0].value) &&
    !node.firstChild.hasLeadingSpaces &&
    !node.firstChild.hasTrailingSpaces &&
    node.isLeadingSpaceSensitive &&
    !node.hasLeadingSpaces &&
    node.isTrailingSpaceSensitive &&
    !node.hasTrailingSpaces &&
    node.prev &&
    node.prev.type === "text" &&
    node.next &&
    node.next.type === "text";
  return ast.map((node) => {
    if (node.children) {
      const isSimpleElementResults = node.children.map(isSimpleElement);
      if (isSimpleElementResults.some(Boolean)) {
        const newChildren = [];
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (isSimpleElementResults[i]) {
            const lastChild = newChildren.pop();
            const nextChild = node.children[++i];
            const ParseSourceSpan = node.sourceSpan.constructor;
            const { isTrailingSpaceSensitive, hasTrailingSpaces } = nextChild;
            newChildren.push(
              lastChild.clone({
                value:
                  lastChild.value +
                  `<${child.rawName}>` +
                  child.firstChild.value +
                  `</${child.rawName}>` +
                  nextChild.value,
                sourceSpan: new ParseSourceSpan(
                  lastChild.sourceSpan.start,
                  nextChild.sourceSpan.end
                ),
                isTrailingSpaceSensitive,
                hasTrailingSpaces,
              })
            );
          } else {
            newChildren.push(child);
          }
        }
        return node.clone({ children: newChildren });
      }
    }
    return node;
  });
}

function extractInterpolation(ast, options) {
  if (options.parser === "html") {
    return ast;
  }

  const interpolationRegex = /{{([\S\s]+?)}}/g;
  return ast.map((node) => {
    if (!canHaveInterpolation(node)) {
      return node;
    }

    const newChildren = [];

    for (const child of node.children) {
      if (child.type !== "text") {
        newChildren.push(child);
        continue;
      }

      const ParseSourceSpan = child.sourceSpan.constructor;

      let startSourceSpan = child.sourceSpan.start;
      let endSourceSpan = null;
      const components = child.value.split(interpolationRegex);
      for (
        let i = 0;
        i < components.length;
        i++, startSourceSpan = endSourceSpan
      ) {
        const value = components[i];

        if (i % 2 === 0) {
          endSourceSpan = startSourceSpan.moveBy(value.length);
          if (value.length !== 0) {
            newChildren.push({
              type: "text",
              value,
              sourceSpan: new ParseSourceSpan(startSourceSpan, endSourceSpan),
            });
          }
          continue;
        }

        endSourceSpan = startSourceSpan.moveBy(value.length + 4); // `{{` + `}}`
        newChildren.push({
          type: "interpolation",
          sourceSpan: new ParseSourceSpan(startSourceSpan, endSourceSpan),
          children:
            value.length === 0
              ? []
              : [
                  {
                    type: "text",
                    value,
                    sourceSpan: new ParseSourceSpan(
                      startSourceSpan.moveBy(2),
                      endSourceSpan.moveBy(-2)
                    ),
                  },
                ],
        });
      }
    }

    return node.clone({ children: newChildren });
  });
}

/**
 * - add `hasLeadingSpaces` field
 * - add `hasTrailingSpaces` field
 * - add `hasDanglingSpaces` field for parent nodes
 * - add `isWhitespaceSensitive`, `isIndentationSensitive` field for text nodes
 * - remove insensitive whitespaces
 */
function extractWhitespaces(ast /*, options*/) {
  const TYPE_WHITESPACE = "whitespace";
  return ast.map((node) => {
    if (!node.children) {
      return node;
    }

    if (
      node.children.length === 0 ||
      (node.children.length === 1 &&
        node.children[0].type === "text" &&
        htmlTrim(node.children[0].value).length === 0)
    ) {
      return node.clone({
        children: [],
        hasDanglingSpaces: node.children.length !== 0,
      });
    }

    const isWhitespaceSensitive = isWhitespaceSensitiveNode(node);
    const isIndentationSensitive = isIndentationSensitiveNode(node);

    return node.clone({
      isWhitespaceSensitive,
      isIndentationSensitive,
      children: node.children
        // extract whitespace nodes
        .reduce((newChildren, child) => {
          if (child.type !== "text" || isWhitespaceSensitive) {
            return newChildren.concat(child);
          }

          const localChildren = [];

          const {
            leadingWhitespace,
            text,
            trailingWhitespace,
          } = getLeadingAndTrailingHtmlWhitespace(child.value);

          if (leadingWhitespace) {
            localChildren.push({ type: TYPE_WHITESPACE });
          }

          const ParseSourceSpan = child.sourceSpan.constructor;

          if (text) {
            localChildren.push({
              type: "text",
              value: text,
              sourceSpan: new ParseSourceSpan(
                child.sourceSpan.start.moveBy(leadingWhitespace.length),
                child.sourceSpan.end.moveBy(-trailingWhitespace.length)
              ),
            });
          }

          if (trailingWhitespace) {
            localChildren.push({ type: TYPE_WHITESPACE });
          }

          return newChildren.concat(localChildren);
        }, [])
        // set hasLeadingSpaces/hasTrailingSpaces and filter whitespace nodes
        .reduce((newChildren, child, i, children) => {
          if (child.type === TYPE_WHITESPACE) {
            return newChildren;
          }

          const hasLeadingSpaces =
            i !== 0 && children[i - 1].type === TYPE_WHITESPACE;
          const hasTrailingSpaces =
            i !== children.length - 1 &&
            children[i + 1].type === TYPE_WHITESPACE;

          return newChildren.concat({
            ...child,
            hasLeadingSpaces,
            hasTrailingSpaces,
          });
        }, []),
    });
  });
}

function addIsSelfClosing(ast /*, options */) {
  return ast.map((node) =>
    Object.assign(node, {
      isSelfClosing:
        !node.children ||
        (node.type === "element" &&
          (node.tagDefinition.isVoid ||
            // self-closing
            node.startSourceSpan === node.endSourceSpan)),
    })
  );
}

function addHasHtmComponentClosingTag(ast, options) {
  return ast.map((node) =>
    node.type !== "element"
      ? node
      : Object.assign(node, {
          hasHtmComponentClosingTag:
            node.endSourceSpan &&
            /^<\s*\/\s*\/\s*>$/.test(
              options.originalText.slice(
                node.endSourceSpan.start.offset,
                node.endSourceSpan.end.offset
              )
            ),
        })
  );
}

function addCssDisplay(ast, options) {
  return ast.map((node) =>
    Object.assign(node, { cssDisplay: getNodeCssStyleDisplay(node, options) })
  );
}

/**
 * - add `isLeadingSpaceSensitive` field
 * - add `isTrailingSpaceSensitive` field
 * - add `isDanglingSpaceSensitive` field for parent nodes
 */
function addIsSpaceSensitive(ast, options) {
  return ast.map((node) => {
    if (!node.children) {
      return node;
    }

    if (node.children.length === 0) {
      return node.clone({
        isDanglingSpaceSensitive: isDanglingSpaceSensitiveNode(node),
      });
    }

    return node.clone({
      children: node.children
        .map((child) => {
          return {
            ...child,
            isLeadingSpaceSensitive: isLeadingSpaceSensitiveNode(
              child,
              options
            ),
            isTrailingSpaceSensitive: isTrailingSpaceSensitiveNode(
              child,
              options
            ),
          };
        })
        .map((child, index, children) => ({
          ...child,
          isLeadingSpaceSensitive:
            index === 0
              ? child.isLeadingSpaceSensitive
              : children[index - 1].isTrailingSpaceSensitive &&
                child.isLeadingSpaceSensitive,
          isTrailingSpaceSensitive:
            index === children.length - 1
              ? child.isTrailingSpaceSensitive
              : children[index + 1].isLeadingSpaceSensitive &&
                child.isTrailingSpaceSensitive,
        })),
    });
  });
}

module.exports = preprocess;
