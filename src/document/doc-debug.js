"use strict";

const { isConcat, getDocParts } = require("./doc-utils");

function flattenDoc(doc) {
  if (isConcat(doc)) {
    const res = [];
    const parts = getDocParts(doc);
    for (let i = 0; i < parts.length; ++i) {
      const doc2 = parts[i];
      if (typeof doc2 !== "string" && isConcat(doc2)) {
        res.push(...flattenDoc(doc2).parts);
      } else {
        const flattened = flattenDoc(doc2);
        if (flattened !== "") {
          res.push(flattened);
        }
      }
    }

    return { type: "concat", parts: res };
  } else if (doc.type === "if-break") {
    return {
      ...doc,
      breakContents:
        doc.breakContents != null ? flattenDoc(doc.breakContents) : null,
      flatContents:
        doc.flatContents != null ? flattenDoc(doc.flatContents) : null,
    };
  } else if (doc.type === "group") {
    return {
      ...doc,
      contents: flattenDoc(doc.contents),
      expandedStates: doc.expandedStates
        ? doc.expandedStates.map(flattenDoc)
        : doc.expandedStates,
    };
  } else if (doc.contents) {
    return { ...doc, contents: flattenDoc(doc.contents) };
  }
  return doc;
}

function printDoc(doc) {
  if (typeof doc === "string") {
    return JSON.stringify(doc);
  }

  if (isConcat(doc)) {
    return `[${getDocParts(doc).map(printDoc).join(", ")}]`;
  }

  if (doc.type === "line") {
    if (doc.literal) {
      return "literalline";
    }
    if (doc.hard) {
      return "hardline";
    }
    if (doc.soft) {
      return "softline";
    }
    return "line";
  }

  if (doc.type === "break-parent") {
    return "breakParent";
  }

  if (doc.type === "trim") {
    return "trim";
  }

  if (doc.type === "indent") {
    return `indent(${printDoc(doc.contents)})`;
  }

  if (doc.type === "align") {
    return doc.n === Number.NEGATIVE_INFINITY
      ? `dedentToRoot(${printDoc(doc.contents)})`
      : doc.n < 0
      ? `dedent(${printDoc(doc.contents)})`
      : doc.n.type === "root"
      ? `markAsRoot(${printDoc(doc.contents)})`
      : `align(${JSON.stringify(doc.n)}, ${printDoc(doc.contents)})`;
  }

  if (doc.type === "if-break") {
    return `ifBreak(${printDoc(doc.breakContents)}${
      doc.flatContents ? `, ${printDoc(doc.flatContents)}` : ""
    })`;
  }

  if (doc.type === "group") {
    if (doc.expandedStates) {
      return `${"conditionalGroup(" + "["}${doc.expandedStates
        .map(printDoc)
        .join(",")}])`;
    }

    return `${doc.break ? "wrappedGroup" : "group"}(${printDoc(doc.contents)})`;
  }

  if (doc.type === "fill") {
    return `${"fill" + "("}${doc.parts.map(printDoc).join(", ")})`;
  }

  if (doc.type === "line-suffix") {
    return `lineSuffix(${printDoc(doc.contents)})`;
  }

  if (doc.type === "line-suffix-boundary") {
    return "lineSuffixBoundary";
  }

  throw new Error(`Unknown doc type ${doc.type}`);
}

module.exports = {
  printDocToDebug(doc) {
    return printDoc(flattenDoc(doc));
  },
};
