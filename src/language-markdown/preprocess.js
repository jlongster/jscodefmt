"use strict";

const { getOrderedListItemInfo, mapAst, splitText } = require("./utils");

// 0x0 ~ 0x10ffff
// eslint-disable-next-line no-control-regex
const isSingleCharRegex = /^([\u0000-\uffff]|[\ud800-\udbff][\udc00-\udfff])$/;

function preprocess(ast, options) {
  ast = restoreUnescapedCharacter(ast, options);
  ast = mergeContinuousTexts(ast);
  ast = transformInlineCode(ast);
  ast = transformIndentedCodeblockAndMarkItsParentList(ast, options);
  ast = markAlignedList(ast, options);
  ast = splitTextIntoSentences(ast, options);
  ast = transformImportExport(ast);
  ast = mergeContinuousImportExport(ast);
  return ast;
}

function transformImportExport(ast) {
  return mapAst(ast, (node) => {
    if (node.type !== "import" && node.type !== "export") {
      return node;
    }

    return { ...node, type: "importExport" };
  });
}

function transformInlineCode(ast) {
  return mapAst(ast, (node) => {
    if (node.type !== "inlineCode") {
      return node;
    }

    return { ...node, value: node.value.replace(/\s+/g, " ") };
  });
}

function restoreUnescapedCharacter(ast, options) {
  return mapAst(ast, (node) => {
    return node.type !== "text"
      ? node
      : {
          ...node,
          value:
            node.value !== "*" &&
            node.value !== "_" &&
            node.value !== "$" && // handle these cases in printer
            isSingleCharRegex.test(node.value) &&
            node.position.end.offset - node.position.start.offset !==
              node.value.length
              ? options.originalText.slice(
                  node.position.start.offset,
                  node.position.end.offset
                )
              : node.value,
        };
  });
}

function mergeContinuousImportExport(ast) {
  return mergeChildren(
    ast,
    (prevNode, node) =>
      prevNode.type === "importExport" && node.type === "importExport",
    (prevNode, node) => ({
      type: "importExport",
      value: prevNode.value + "\n\n" + node.value,
      position: {
        start: prevNode.position.start,
        end: node.position.end,
      },
    })
  );
}

function mergeChildren(ast, shouldMerge, mergeNode) {
  return mapAst(ast, (node) => {
    if (!node.children) {
      return node;
    }
    const children = node.children.reduce((current, child) => {
      const lastChild = current[current.length - 1];
      if (lastChild && shouldMerge(lastChild, child)) {
        current.splice(-1, 1, mergeNode(lastChild, child));
      } else {
        current.push(child);
      }
      return current;
    }, []);
    return { ...node, children };
  });
}

function mergeContinuousTexts(ast) {
  return mergeChildren(
    ast,
    (prevNode, node) => prevNode.type === "text" && node.type === "text",
    (prevNode, node) => ({
      type: "text",
      value: prevNode.value + node.value,
      position: {
        start: prevNode.position.start,
        end: node.position.end,
      },
    })
  );
}

function splitTextIntoSentences(ast, options) {
  return mapAst(ast, (node, index, [parentNode]) => {
    if (node.type !== "text") {
      return node;
    }

    let { value } = node;

    if (parentNode.type === "paragraph") {
      if (index === 0) {
        value = value.trimStart();
      }
      if (index === parentNode.children.length - 1) {
        value = value.trimEnd();
      }
    }

    return {
      type: "sentence",
      position: node.position,
      children: splitText(value, options),
    };
  });
}

function transformIndentedCodeblockAndMarkItsParentList(ast, options) {
  return mapAst(ast, (node, index, parentStack) => {
    if (node.type === "code") {
      // the first char may point to `\n`, e.g. `\n\t\tbar`, just ignore it
      const isIndented = /^\n?( {4,}|\t)/.test(
        options.originalText.slice(
          node.position.start.offset,
          node.position.end.offset
        )
      );

      node.isIndented = isIndented;

      if (isIndented) {
        for (let i = 0; i < parentStack.length; i++) {
          const parent = parentStack[i];

          // no need to check checked items
          if (parent.hasIndentedCodeblock) {
            break;
          }

          if (parent.type === "list") {
            parent.hasIndentedCodeblock = true;
          }
        }
      }
    }
    return node;
  });
}

function markAlignedList(ast, options) {
  return mapAst(ast, (node, index, parentStack) => {
    if (node.type === "list" && node.children.length !== 0) {
      // if one of its parents is not aligned, it's not possible to be aligned in sub-lists
      for (let i = 0; i < parentStack.length; i++) {
        const parent = parentStack[i];
        if (parent.type === "list" && !parent.isAligned) {
          node.isAligned = false;
          return node;
        }
      }

      node.isAligned = isAligned(node);
    }

    return node;
  });

  function getListItemStart(listItem) {
    return listItem.children.length === 0
      ? -1
      : listItem.children[0].position.start.column - 1;
  }

  function isAligned(list) {
    if (!list.ordered) {
      /**
       * - 123
       * - 123
       */
      return true;
    }

    const [firstItem, secondItem] = list.children;

    const firstInfo = getOrderedListItemInfo(firstItem, options.originalText);

    if (firstInfo.leadingSpaces.length > 1) {
      /**
       * 1.   123
       *
       * 1.   123
       * 1. 123
       */
      return true;
    }

    const firstStart = getListItemStart(firstItem);

    if (firstStart === -1) {
      /**
       * 1.
       *
       * 1.
       * 1.
       */
      return false;
    }

    if (list.children.length === 1) {
      /**
       * aligned:
       *
       * 11. 123
       *
       * not aligned:
       *
       * 1. 123
       */
      return firstStart % options.tabWidth === 0;
    }

    const secondStart = getListItemStart(secondItem);

    if (firstStart !== secondStart) {
      /**
       * 11. 123
       * 1. 123
       *
       * 1. 123
       * 11. 123
       */
      return false;
    }

    if (firstStart % options.tabWidth === 0) {
      /**
       * 11. 123
       * 12. 123
       */
      return true;
    }

    /**
     * aligned:
     *
     * 11. 123
     * 1.  123
     *
     * not aligned:
     *
     * 1. 123
     * 2. 123
     */
    const secondInfo = getOrderedListItemInfo(secondItem, options.originalText);
    return secondInfo.leadingSpaces.length > 1;
  }
}

module.exports = preprocess;
