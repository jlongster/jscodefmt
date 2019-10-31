"use strict";

/**
 * @typedef {Object} DocObject
 * @property {string} type
 *
 * @typedef {string | DocObject} Doc
 */

function assertDoc(val) {
  /* istanbul ignore if */
  if (
    !(typeof val === "string" || (val != null && typeof val.type === "string"))
  ) {
    throw new Error(
      "Value " + JSON.stringify(val) + " is not a valid document"
    );
  }
}

/**
 * @param {Doc[]} parts
 * @returns Doc
 */
function concat(parts) {
  if (process.env.NODE_ENV !== "production") {
    parts.forEach(assertDoc);
  }

  // We cannot do this until we change `printJSXElement` to not
  // access the internals of a document directly.
  // if(parts.length === 1) {
  //   // If it's a single document, no need to concat it.
  //   return parts[0];
  // }
  return { type: "concat", parts };
}

/**
 * @param {Doc} contents
 * @returns Doc
 */
function indent(contents) {
  if (process.env.NODE_ENV !== "production") {
    assertDoc(contents);
  }

  return { type: "indent", contents };
}

function align(n, contents) {
  if (process.env.NODE_ENV !== "production") {
    assertDoc(contents);
  }

  return { type: "align", contents, n };
}

/**
 * @param {Doc} contents
 * @param {Object} [opts]
 * @returns Doc
 */
function group(contents, opts) {
  opts = opts || {};

  if (process.env.NODE_ENV !== "production") {
    assertDoc(contents);
  }

  return {
    type: "group",
    id: opts.id,
    contents: contents,
    break: !!opts.shouldBreak,
    expandedStates: opts.expandedStates
  };
}

function dedentToRoot(contents) {
  return align(-Infinity, contents);
}

function markAsRoot(contents) {
  return align({ type: "root" }, contents);
}

function dedent(contents) {
  return align(-1, contents);
}

function conditionalGroup(states, opts) {
  return group(
    states[0],
    Object.assign(opts || {}, { expandedStates: states })
  );
}

function fill(parts) {
  if (process.env.NODE_ENV !== "production") {
    parts.forEach(assertDoc);
  }

  return { type: "fill", parts };
}

function ifBreak(breakContents, flatContents, opts) {
  opts = opts || {};

  if (process.env.NODE_ENV !== "production") {
    if (breakContents) {
      assertDoc(breakContents);
    }
    if (flatContents) {
      assertDoc(flatContents);
    }
  }

  return {
    type: "if-break",
    breakContents,
    flatContents,
    groupId: opts.groupId
  };
}

function lineSuffix(contents) {
  if (process.env.NODE_ENV !== "production") {
    assertDoc(contents);
  }
  return { type: "line-suffix", contents };
}

const lineSuffixBoundary = { type: "line-suffix-boundary" };
const breakParent = { type: "break-parent" };
const trim = { type: "trim" };
const line = { type: "line" };
const softline = { type: "line", soft: true };
const hardline = concat([{ type: "line", hard: true }, breakParent]);
const literalline = concat([
  { type: "line", hard: true, literal: true },
  breakParent
]);
const cursor = { type: "cursor", placeholder: Symbol("cursor") };

function join(sep, arr) {
  const res = [];

  for (let i = 0; i < arr.length; i++) {
    if (i !== 0) {
      res.push(sep);
    }

    res.push(arr[i]);
  }

  return concat(res);
}

function addAlignmentToDoc(doc, size, tabWidth) {
  let aligned = doc;
  if (size > 0) {
    // Use indent to add tabs for all the levels of tabs we need
    for (let i = 0; i < Math.floor(size / tabWidth); ++i) {
      aligned = indent(aligned);
    }
    // Use align for all the spaces that are needed
    aligned = align(size % tabWidth, aligned);
    // size is absolute from 0 and not relative to the current
    // indentation, so we use -Infinity to reset the indentation to 0
    aligned = align(-Infinity, aligned);
  }
  return aligned;
}

module.exports = {
  concat,
  join,
  line,
  softline,
  hardline,
  literalline,
  group,
  conditionalGroup,
  fill,
  lineSuffix,
  lineSuffixBoundary,
  cursor,
  breakParent,
  ifBreak,
  trim,
  indent,
  align,
  addAlignmentToDoc,
  markAsRoot,
  dedentToRoot,
  dedent
};
