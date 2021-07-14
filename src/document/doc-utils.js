"use strict";
const getLast = require("../utils/get-last");
const { literalline, join } = require("./doc-builders");

const isConcat = (doc) => Array.isArray(doc) || (doc && doc.type === "concat");
const getDocParts = (doc) => {
  if (Array.isArray(doc)) {
    return doc;
  }

  /* istanbul ignore next */
  if (doc.type !== "concat" && doc.type !== "fill") {
    throw new Error("Expect doc type to be `concat` or `fill`.");
  }

  return doc.parts;
};

// Using a unique object to compare by reference.
const traverseDocOnExitStackMarker = {};

function traverseDoc(doc, onEnter, onExit, shouldTraverseConditionalGroups) {
  const docsStack = [doc];

  while (docsStack.length > 0) {
    const doc = docsStack.pop();

    if (doc === traverseDocOnExitStackMarker) {
      onExit(docsStack.pop());
      continue;
    }

    if (onExit) {
      docsStack.push(doc, traverseDocOnExitStackMarker);
    }

    if (
      // Should Recurse
      !onEnter ||
      onEnter(doc) !== false
    ) {
      // When there are multiple parts to process,
      // the parts need to be pushed onto the stack in reverse order,
      // so that they are processed in the original order
      // when the stack is popped.
      if (isConcat(doc) || doc.type === "fill") {
        const parts = getDocParts(doc);
        for (let ic = parts.length, i = ic - 1; i >= 0; --i) {
          docsStack.push(parts[i]);
        }
      } else if (doc.type === "if-break") {
        if (doc.flatContents) {
          docsStack.push(doc.flatContents);
        }
        if (doc.breakContents) {
          docsStack.push(doc.breakContents);
        }
      } else if (doc.type === "group" && doc.expandedStates) {
        if (shouldTraverseConditionalGroups) {
          for (let ic = doc.expandedStates.length, i = ic - 1; i >= 0; --i) {
            docsStack.push(doc.expandedStates[i]);
          }
        } else {
          docsStack.push(doc.contents);
        }
      } else if (doc.contents) {
        docsStack.push(doc.contents);
      }
    }
  }
}

function mapDoc(doc, cb) {
  // Within a doc tree, the same subtrees can be found multiple times.
  // E.g., often this happens in conditional groups.
  // As an optimization (those subtrees can be huge) and to maintain the
  // reference structure of the tree, the mapping results are cached in
  // a map and reused.
  const mapped = new Map();

  return rec(doc);

  function rec(doc) {
    if (mapped.has(doc)) {
      return mapped.get(doc);
    }
    const result = process(doc);
    mapped.set(doc, result);
    return result;
  }

  function process(doc) {
    if (Array.isArray(doc)) {
      return cb(doc.map(rec));
    }

    if (doc.type === "concat" || doc.type === "fill") {
      const parts = doc.parts.map(rec);
      return cb({ ...doc, parts });
    }

    if (doc.type === "if-break") {
      const breakContents = doc.breakContents && rec(doc.breakContents);
      const flatContents = doc.flatContents && rec(doc.flatContents);
      return cb({ ...doc, breakContents, flatContents });
    }

    if (doc.type === "group" && doc.expandedStates) {
      const expandedStates = doc.expandedStates.map(rec);
      const contents = expandedStates[0];
      return cb({ ...doc, contents, expandedStates });
    }

    if (doc.contents) {
      const contents = rec(doc.contents);
      return cb({ ...doc, contents });
    }

    return cb(doc);
  }
}

function findInDoc(doc, fn, defaultValue) {
  let result = defaultValue;
  let hasStopped = false;
  function findInDocOnEnterFn(doc) {
    const maybeResult = fn(doc);
    if (maybeResult !== undefined) {
      hasStopped = true;
      result = maybeResult;
    }
    if (hasStopped) {
      return false;
    }
  }
  traverseDoc(doc, findInDocOnEnterFn);
  return result;
}

function willBreakFn(doc) {
  if (doc.type === "group" && doc.break) {
    return true;
  }
  if (doc.type === "line" && doc.hard) {
    return true;
  }
  if (doc.type === "break-parent") {
    return true;
  }
}

function willBreak(doc) {
  return findInDoc(doc, willBreakFn, false);
}

function breakParentGroup(groupStack) {
  if (groupStack.length > 0) {
    const parentGroup = getLast(groupStack);
    // Breaks are not propagated through conditional groups because
    // the user is expected to manually handle what breaks.
    if (!parentGroup.expandedStates && !parentGroup.break) {
      // An alternative truthy value allows to distinguish propagated group breaks
      // and not to print them as `group(..., { break: true })` in `--debug-print-doc`.
      parentGroup.break = "propagated";
    }
  }
  return null;
}

function propagateBreaks(doc) {
  const alreadyVisitedSet = new Set();
  const groupStack = [];
  function propagateBreaksOnEnterFn(doc) {
    if (doc.type === "break-parent") {
      breakParentGroup(groupStack);
    }
    if (doc.type === "group") {
      groupStack.push(doc);
      if (alreadyVisitedSet.has(doc)) {
        return false;
      }
      alreadyVisitedSet.add(doc);
    }
  }
  function propagateBreaksOnExitFn(doc) {
    if (doc.type === "group") {
      const group = groupStack.pop();
      if (group.break) {
        breakParentGroup(groupStack);
      }
    }
  }
  traverseDoc(
    doc,
    propagateBreaksOnEnterFn,
    propagateBreaksOnExitFn,
    /* shouldTraverseConditionalGroups */ true
  );
}

function removeLinesFn(doc) {
  // Force this doc into flat mode by statically converting all
  // lines into spaces (or soft lines into nothing). Hard lines
  // should still output because there's too great of a chance
  // of breaking existing assumptions otherwise.
  if (doc.type === "line" && !doc.hard) {
    return doc.soft ? "" : " ";
  }

  if (doc.type === "if-break") {
    return doc.flatContents || "";
  }

  return doc;
}

function removeLines(doc) {
  return mapDoc(doc, removeLinesFn);
}

const isHardline = (doc, nextDoc) =>
  doc &&
  doc.type === "line" &&
  doc.hard &&
  nextDoc &&
  nextDoc.type === "break-parent";
function stripDocTrailingHardlineFromDoc(doc) {
  if (!doc) {
    return doc;
  }

  if (isConcat(doc) || doc.type === "fill") {
    const parts = getDocParts(doc);

    while (parts.length > 1 && isHardline(...parts.slice(-2))) {
      parts.length -= 2;
    }

    if (parts.length > 0) {
      const lastPart = stripDocTrailingHardlineFromDoc(getLast(parts));
      parts[parts.length - 1] = lastPart;
    }
    return Array.isArray(doc) ? parts : { ...doc, parts };
  }

  switch (doc.type) {
    case "align":
    case "indent":
    case "indent-if-break":
    case "group":
    case "line-suffix":
    case "label": {
      const contents = stripDocTrailingHardlineFromDoc(doc.contents);
      return { ...doc, contents };
    }
    case "if-break": {
      const breakContents = stripDocTrailingHardlineFromDoc(doc.breakContents);
      const flatContents = stripDocTrailingHardlineFromDoc(doc.flatContents);
      return { ...doc, breakContents, flatContents };
    }
  }

  return doc;
}

function stripTrailingHardline(doc) {
  // HACK remove ending hardline, original PR: #1984
  return stripDocTrailingHardlineFromDoc(cleanDoc(doc));
}

function cleanDocFn(doc) {
  switch (doc.type) {
    case "fill":
      if (doc.parts.length === 0 || doc.parts.every((part) => part === "")) {
        return "";
      }
      break;
    case "group":
      if (!doc.contents && !doc.id && !doc.break && !doc.expandedStates) {
        return "";
      }
      // Remove nested only group
      if (
        doc.contents.type === "group" &&
        doc.contents.id === doc.id &&
        doc.contents.break === doc.break &&
        doc.contents.expandedStates === doc.expandedStates
      ) {
        return doc.contents;
      }
      break;
    case "align":
    case "indent":
    case "indent-if-break":
    case "line-suffix":
      if (!doc.contents) {
        return "";
      }
      break;
    case "if-break":
      if (!doc.flatContents && !doc.breakContents) {
        return "";
      }
      break;
  }

  if (!isConcat(doc)) {
    return doc;
  }

  const parts = [];
  for (const part of getDocParts(doc)) {
    if (!part) {
      continue;
    }
    const [currentPart, ...restParts] = isConcat(part)
      ? getDocParts(part)
      : [part];
    if (typeof currentPart === "string" && typeof getLast(parts) === "string") {
      parts[parts.length - 1] += currentPart;
    } else {
      parts.push(currentPart);
    }
    parts.push(...restParts);
  }

  if (parts.length === 0) {
    return "";
  }

  if (parts.length === 1) {
    return parts[0];
  }
  return Array.isArray(doc) ? parts : { ...doc, parts };
}
// A safer version of `normalizeDoc`
// - `normalizeDoc` concat strings and flat "concat" in `fill`, while `cleanDoc` don't
// - On `concat` object, `normalizeDoc` always return object with `parts`, `cleanDoc` may return strings
// - `cleanDoc` also remove nested `group`s and empty `fill`/`align`/`indent`/`line-suffix`/`if-break` if possible
function cleanDoc(doc) {
  return mapDoc(doc, (currentDoc) => cleanDocFn(currentDoc));
}

function normalizeParts(parts) {
  const newParts = [];

  const restParts = parts.filter(Boolean);
  while (restParts.length > 0) {
    const part = restParts.shift();

    if (!part) {
      continue;
    }

    if (isConcat(part)) {
      restParts.unshift(...getDocParts(part));
      continue;
    }

    if (
      newParts.length > 0 &&
      typeof getLast(newParts) === "string" &&
      typeof part === "string"
    ) {
      newParts[newParts.length - 1] += part;
      continue;
    }

    newParts.push(part);
  }

  return newParts;
}

function normalizeDoc(doc) {
  return mapDoc(doc, (currentDoc) => {
    if (Array.isArray(currentDoc)) {
      return normalizeParts(currentDoc);
    }
    if (!currentDoc.parts) {
      return currentDoc;
    }
    return {
      ...currentDoc,
      parts: normalizeParts(currentDoc.parts),
    };
  });
}

function replaceNewlinesWithLiterallines(doc) {
  return mapDoc(doc, (currentDoc) =>
    typeof currentDoc === "string" && currentDoc.includes("\n")
      ? join(literalline, currentDoc.split("\n"))
      : currentDoc
  );
}

// This function need return array
// TODO: remove `.parts` when we remove `docBuilders.concat()`
function replaceEndOfLineWith(text, replacement) {
  return join(replacement, text.split("\n")).parts;
}

function canBreakFn(doc) {
  if (doc.type === "line") {
    return true;
  }
}

function canBreak(doc) {
  return findInDoc(doc, canBreakFn, false);
}

module.exports = {
  isConcat,
  getDocParts,
  canBreak,
  willBreak,
  traverseDoc,
  findInDoc,
  mapDoc,
  propagateBreaks,
  removeLines,
  stripTrailingHardline,
  normalizeParts,
  normalizeDoc,
  cleanDoc,
  replaceEndOfLineWith,
  replaceNewlinesWithLiterallines,
};
