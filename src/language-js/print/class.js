"use strict";

const { isNonEmptyArray, createGroupIdMapper } = require("../../common/util");
const { printComments, printDanglingComments } = require("../../main/comments");
const {
  builders: { join, line, hardline, softline, group, indent, ifBreak },
} = require("../../document");
const {
  hasComment,
  CommentCheckFlags,
  hasNewlineBetweenOrAfterDecorators,
} = require("../utils");
const { getTypeParametersGroupId } = require("./type-parameters");
const { printMethod } = require("./function");
const { printOptionalToken, printTypeAnnotation } = require("./misc");
const { printPropertyKey } = require("./property");
const { printAssignmentRight } = require("./assignment");

function printClass(path, options, print) {
  const n = path.getValue();
  const parts = [];

  if (n.declare) {
    parts.push("declare ");
  }

  if (n.abstract) {
    parts.push("abstract ");
  }

  parts.push("class");

  // Keep old behaviour of extends in same line
  // If there is only on extends and there are not comments
  const groupMode =
    (n.id && hasComment(n.id, CommentCheckFlags.Trailing)) ||
    (n.superClass && hasComment(n.superClass)) ||
    isNonEmptyArray(n.extends) || // DeclareClass
    isNonEmptyArray(n.mixins) ||
    isNonEmptyArray(n.implements);

  const partsGroup = [];
  const extendsParts = [];

  if (n.id) {
    partsGroup.push(" ", path.call(print, "id"));
  }

  partsGroup.push(path.call(print, "typeParameters"));

  if (n.superClass) {
    const printed = [
      "extends ",
      printSuperClass(path, options, print),
      path.call(print, "superTypeParameters"),
    ];
    const printedWithComments = path.call(
      (superClass) => printComments(superClass, () => printed, options),
      "superClass"
    );
    if (groupMode) {
      extendsParts.push(line, group(printedWithComments));
    } else {
      extendsParts.push(" ", printedWithComments);
    }
  } else {
    extendsParts.push(printList(path, options, print, "extends"));
  }

  extendsParts.push(
    printList(path, options, print, "mixins"),
    printList(path, options, print, "implements")
  );

  if (groupMode) {
    const printedExtends = extendsParts;
    let printedPartsGroup;
    if (shouldIndentOnlyHeritageClauses(n)) {
      printedPartsGroup = [
        ...partsGroup,
        ifBreak(indent(printedExtends), printedExtends),
      ];
    } else {
      printedPartsGroup = indent([...partsGroup, printedExtends]);
    }
    parts.push(group(printedPartsGroup, { id: getHeritageGroupId(n) }));
  } else {
    parts.push(...partsGroup, ...extendsParts);
  }

  parts.push(" ", path.call(print, "body"));

  return parts;
}

const getHeritageGroupId = createGroupIdMapper("heritageGroup");

function printHardlineAfterHeritage(node) {
  return ifBreak(hardline, "", { groupId: getHeritageGroupId(node) });
}

function hasMultipleHeritage(node) {
  return (
    ["superClass", "extends", "mixins", "implements"].filter(
      (key) => !!node[key]
    ).length > 1
  );
}

function shouldIndentOnlyHeritageClauses(node) {
  return (
    node.typeParameters &&
    !hasComment(
      node.typeParameters,
      CommentCheckFlags.Trailing | CommentCheckFlags.Line
    ) &&
    !hasMultipleHeritage(node)
  );
}

function printList(path, options, print, listName) {
  const n = path.getValue();
  if (!isNonEmptyArray(n[listName])) {
    return "";
  }

  const printedLeadingComments = printDanglingComments(
    path,
    options,
    /* sameIndent */ true,
    ({ marker }) => marker === listName
  );
  return [
    shouldIndentOnlyHeritageClauses(n)
      ? ifBreak(" ", line, {
          groupId: getTypeParametersGroupId(n.typeParameters),
        })
      : line,
    printedLeadingComments,
    printedLeadingComments && hardline,
    listName,
    group(indent([line, join([",", line], path.map(print, listName))])),
  ];
}

function printSuperClass(path, options, print) {
  const printed = path.call(print, "superClass");
  const parent = path.getParentNode();
  if (parent.type === "AssignmentExpression") {
    return group(
      ifBreak(["(", indent([softline, printed]), softline, ")"], printed)
    );
  }
  return printed;
}

function printClassMethod(path, options, print) {
  const n = path.getValue();
  const parts = [];

  if (isNonEmptyArray(n.decorators)) {
    parts.push(printDecorators(path, options, print));
  }
  if (n.accessibility) {
    parts.push(`${n.accessibility} `);
  }
  if (n.static) {
    parts.push("static ");
  }
  if (n.type === "TSAbstractMethodDefinition" || n.abstract) {
    parts.push("abstract ");
  }

  parts.push(printMethod(path, options, print));

  return parts;
}

function printClassProperty(path, options, print) {
  const n = path.getValue();
  const parts = [];
  const semi = options.semi ? ";" : "";

  if (isNonEmptyArray(n.decorators)) {
    parts.push(printDecorators(path, options, print));
  }
  if (n.accessibility) {
    parts.push(`${n.accessibility} `);
  }
  if (n.declare) {
    parts.push("declare ");
  }
  if (n.static) {
    parts.push("static ");
  }
  if (n.type === "TSAbstractClassProperty" || n.abstract) {
    parts.push("abstract ");
  }
  if (n.readonly) {
    parts.push("readonly ");
  }
  if (n.variance) {
    parts.push(path.call(print, "variance"));
  }
  parts.push(
    printPropertyKey(path, options, print),
    printOptionalToken(path),
    printTypeAnnotation(path, options, print)
  );
  if (n.value) {
    parts.push(
      " =",
      printAssignmentRight(n.key, n.value, path.call(print, "value"), options)
    );
  }

  parts.push(semi);

  return group(parts);
}

function printDecorators(path, options, print) {
  const node = path.getValue();
  return group([
    join(line, path.map(print, "decorators")),
    hasNewlineBetweenOrAfterDecorators(node, options) ? hardline : line,
  ]);
}

module.exports = {
  printClass,
  printClassMethod,
  printClassProperty,
  printHardlineAfterHeritage,
};
