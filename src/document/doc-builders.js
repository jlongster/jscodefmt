"use strict";

/**
 * TBD properly tagged union for Doc object type is needed here.
 *
 * @typedef {object} DocObject
 * @property {string} type
 * @property {boolean} [hard]
 * @property {boolean} [literal]
 *
 * @typedef {Doc[]} DocArray
 *
 * @typedef {string | DocObject | DocArray} Doc
 */

/**
 * @param {Doc} val
 */
function assertDoc(val) {
  if (typeof val === "string") {
    return;
  }

  if (Array.isArray(val)) {
    for (const doc of val) {
      assertDoc(doc);
    }
    return;
  }

  if (val && typeof val.type === "string") {
    return;
  }

  /* istanbul ignore next */
  throw new Error("Value " + JSON.stringify(val) + " is not a valid document");
}

/**
 * @param {Doc[]} parts
 * @returns Doc
 */
function concat(parts) {
  if (process.env.NODE_ENV !== "production") {
    for (const part of parts) {
      assertDoc(part);
    }
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

/**
 * @param {number | string} widthOrString
 * @param {Doc} contents
 * @returns Doc
 */
function align(widthOrString, contents) {
  if (process.env.NODE_ENV !== "production") {
    assertDoc(contents);
  }

  return { type: "align", contents, n: widthOrString };
}

/**
 * @param {Doc} contents
 * @param {object} [opts] - TBD ???
 * @returns Doc
 */
function group(contents, opts = {}) {
  if (process.env.NODE_ENV !== "production") {
    assertDoc(contents);
  }

  return {
    type: "group",
    id: opts.id,
    contents,
    break: Boolean(opts.shouldBreak),
    expandedStates: opts.expandedStates,
  };
}

/**
 * @param {Doc} contents
 * @returns Doc
 */
function dedentToRoot(contents) {
  return align(Number.NEGATIVE_INFINITY, contents);
}

/**
 * @param {Doc} contents
 * @returns Doc
 */
function markAsRoot(contents) {
  // @ts-ignore - TBD ???:
  return align({ type: "root" }, contents);
}

/**
 * @param {Doc} contents
 * @returns Doc
 */
function dedent(contents) {
  return align(-1, contents);
}

/**
 * @param {Doc[]} states
 * @param {object} [opts] - TBD ???
 * @returns Doc
 */
function conditionalGroup(states, opts) {
  return group(states[0], { ...opts, expandedStates: states });
}

/**
 * @param {Doc[]} parts
 * @returns Doc
 */
function fill(parts) {
  if (process.env.NODE_ENV !== "production") {
    for (const [index, part] of parts.entries()) {
      assertDoc(part);
      if (index % 2 === 1 && part.type !== "line") {
        const type = part.type || (Array.isArray(part) ? "array" : "string");
        console.log(parts);
        throw new Error(
          `elements with odd indices expected to be line breaks, got "${type}".`
        );
      }
    }
  }

  return { type: "fill", parts };
}

/**
 * @param {Doc} [breakContents]
 * @param {Doc} [flatContents]
 * @param {object} [opts] - TBD ???
 * @returns Doc
 */
function ifBreak(breakContents, flatContents, opts = {}) {
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
    groupId: opts.groupId,
  };
}

/**
 * Optimized version of `ifBreak(indent(doc), doc, { groupId: ... })`
 * @param {Doc} contents
 * @param {{ groupId: symbol, negate?: boolean }} opts
 * @returns Doc
 */
function indentIfBreak(contents, opts) {
  return {
    type: "indent-if-break",
    contents,
    groupId: opts.groupId,
    negate: opts.negate,
  };
}

/**
 * @param {Doc} contents
 * @returns Doc
 */
function lineSuffix(contents) {
  if (process.env.NODE_ENV !== "production") {
    assertDoc(contents);
  }
  return { type: "line-suffix", contents };
}

const lineSuffixBoundary = { type: "line-suffix-boundary" };
const breakParent = { type: "break-parent" };
const trim = { type: "trim" };

const hardlineWithoutBreakParent = { type: "line", hard: true };
const literallineWithoutBreakParent = {
  type: "line",
  hard: true,
  literal: true,
};

const line = { type: "line" };
const softline = { type: "line", soft: true };
// eslint-disable-next-line prettier-internal-rules/no-doc-builder-concat
const hardline = concat([hardlineWithoutBreakParent, breakParent]);
// eslint-disable-next-line prettier-internal-rules/no-doc-builder-concat
const literalline = concat([literallineWithoutBreakParent, breakParent]);

const cursor = { type: "cursor", placeholder: Symbol("cursor") };

/**
 * @param {Doc} sep
 * @param {Doc[]} arr
 * @returns Doc
 */
function join(sep, arr) {
  const res = [];

  for (let i = 0; i < arr.length; i++) {
    if (i !== 0) {
      res.push(sep);
    }

    res.push(arr[i]);
  }

  // eslint-disable-next-line prettier-internal-rules/no-doc-builder-concat
  return concat(res);
}

/**
 * @param {Doc} doc
 * @param {number} size
 * @param {number} tabWidth
 */
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
    aligned = align(Number.NEGATIVE_INFINITY, aligned);
  }
  return aligned;
}

function label(label, contents) {
  return { type: "label", label, contents };
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
  indentIfBreak,
  align,
  addAlignmentToDoc,
  markAsRoot,
  dedentToRoot,
  dedent,
  hardlineWithoutBreakParent,
  literallineWithoutBreakParent,
  label,
};
