"use strict";

const { getStringWidth } = require("../common/util");
const { convertEndOfLineToChars } = require("../common/end-of-line");
const { concat, fill, cursor } = require("./doc-builders");
const { isConcat, getDocParts } = require("./doc-utils");

/** @type {Record<symbol, typeof MODE_BREAK | typeof MODE_FLAT>} */
let groupModeMap;

const MODE_BREAK = 1;
const MODE_FLAT = 2;

function rootIndent() {
  return { value: "", length: 0, queue: [] };
}

function makeIndent(ind, options) {
  return generateInd(ind, { type: "indent" }, options);
}

function makeAlign(indent, n, options) {
  if (n === Number.NEGATIVE_INFINITY) {
    return indent.root || rootIndent();
  }

  if (n < 0) {
    return generateInd(indent, { type: "dedent" }, options);
  }

  if (!n) {
    return indent;
  }

  if (n.type === "root") {
    return { ...indent, root: indent };
  }

  const alignType = typeof n === "string" ? "stringAlign" : "numberAlign";

  return generateInd(indent, { type: alignType, n }, options);
}

function generateInd(ind, newPart, options) {
  const queue =
    newPart.type === "dedent"
      ? ind.queue.slice(0, -1)
      : [...ind.queue, newPart];

  let value = "";
  let length = 0;
  let lastTabs = 0;
  let lastSpaces = 0;

  for (const part of queue) {
    switch (part.type) {
      case "indent":
        flush();
        if (options.useTabs) {
          addTabs(1);
        } else {
          addSpaces(options.tabWidth);
        }
        break;
      case "stringAlign":
        flush();
        value += part.n;
        length += part.n.length;
        break;
      case "numberAlign":
        lastTabs += 1;
        lastSpaces += part.n;
        break;
      /* istanbul ignore next */
      default:
        throw new Error(`Unexpected type '${part.type}'`);
    }
  }

  flushSpaces();

  return { ...ind, value, length, queue };

  function addTabs(count) {
    value += "\t".repeat(count);
    length += options.tabWidth * count;
  }

  function addSpaces(count) {
    value += " ".repeat(count);
    length += count;
  }

  function flush() {
    if (options.useTabs) {
      flushTabs();
    } else {
      flushSpaces();
    }
  }

  function flushTabs() {
    if (lastTabs > 0) {
      addTabs(lastTabs);
    }
    resetLast();
  }

  function flushSpaces() {
    if (lastSpaces > 0) {
      addSpaces(lastSpaces);
    }
    resetLast();
  }

  function resetLast() {
    lastTabs = 0;
    lastSpaces = 0;
  }
}

function trim(out) {
  if (out.length === 0) {
    return 0;
  }

  let trimCount = 0;

  // Trim whitespace at the end of line
  while (
    out.length > 0 &&
    typeof out[out.length - 1] === "string" &&
    /^[\t ]*$/.test(out[out.length - 1])
  ) {
    trimCount += out.pop().length;
  }

  if (out.length > 0 && typeof out[out.length - 1] === "string") {
    const trimmed = out[out.length - 1].replace(/[\t ]*$/, "");
    trimCount += out[out.length - 1].length - trimmed.length;
    out[out.length - 1] = trimmed;
  }

  return trimCount;
}

function fits(next, restCommands, width, options, hasLineSuffix, mustBeFlat) {
  let restIdx = restCommands.length;
  const cmds = [next];
  // `out` is only used for width counting because `trim` requires to look
  // backwards for space characters.
  const out = [];
  while (width >= 0) {
    if (cmds.length === 0) {
      if (restIdx === 0) {
        return true;
      }
      cmds.push(restCommands[restIdx - 1]);

      restIdx--;

      continue;
    }

    const [ind, mode, doc] = cmds.pop();

    if (typeof doc === "string") {
      out.push(doc);

      width -= getStringWidth(doc);
    } else if (isConcat(doc)) {
      const parts = getDocParts(doc);
      for (let i = parts.length - 1; i >= 0; i--) {
        cmds.push([ind, mode, parts[i]]);
      }
    } else {
      switch (doc.type) {
        case "indent":
          cmds.push([makeIndent(ind, options), mode, doc.contents]);

          break;
        case "align":
          cmds.push([makeAlign(ind, doc.n, options), mode, doc.contents]);

          break;
        case "trim":
          width += trim(out);

          break;
        case "group":
          if (mustBeFlat && doc.break) {
            return false;
          }
          cmds.push([ind, doc.break ? MODE_BREAK : mode, doc.contents]);

          if (doc.id) {
            groupModeMap[doc.id] = cmds[cmds.length - 1][1];
          }
          break;
        case "fill":
          for (let i = doc.parts.length - 1; i >= 0; i--) {
            cmds.push([ind, mode, doc.parts[i]]);
          }

          break;
        case "if-break": {
          const groupMode = doc.groupId ? groupModeMap[doc.groupId] : mode;
          if (groupMode === MODE_BREAK && doc.breakContents) {
            cmds.push([ind, mode, doc.breakContents]);
          }
          if (groupMode === MODE_FLAT && doc.flatContents) {
            cmds.push([ind, mode, doc.flatContents]);
          }

          break;
        }
        case "line":
          switch (mode) {
            // fallthrough
            case MODE_FLAT:
              if (!doc.hard) {
                if (!doc.soft) {
                  out.push(" ");

                  width -= 1;
                }

                break;
              }
              return true;

            case MODE_BREAK:
              return true;
          }
          break;
        case "line-suffix":
          hasLineSuffix = true;
          break;
        case "line-suffix-boundary":
          if (hasLineSuffix) {
            return false;
          }
          break;
      }
    }
  }
  return false;
}

function printDocToString(doc, options) {
  groupModeMap = {};

  const width = options.printWidth;
  const newLine = convertEndOfLineToChars(options.endOfLine);
  let pos = 0;
  // cmds is basically a stack. We've turned a recursive call into a
  // while loop which is much faster. The while loop below adds new
  // cmds to the array instead of recursively calling `print`.
  const cmds = [[rootIndent(), MODE_BREAK, doc]];
  const out = [];
  let shouldRemeasure = false;
  let lineSuffix = [];

  while (cmds.length > 0) {
    const [ind, mode, doc] = cmds.pop();

    if (typeof doc === "string") {
      const formatted = newLine !== "\n" ? doc.replace(/\n/g, newLine) : doc;
      out.push(formatted);
      pos += getStringWidth(formatted);
    } else if (isConcat(doc)) {
      const parts = getDocParts(doc);
      for (let i = parts.length - 1; i >= 0; i--) {
        cmds.push([ind, mode, parts[i]]);
      }
    } else {
      switch (doc.type) {
        case "cursor":
          out.push(cursor.placeholder);

          break;
        case "indent":
          cmds.push([makeIndent(ind, options), mode, doc.contents]);

          break;
        case "align":
          cmds.push([makeAlign(ind, doc.n, options), mode, doc.contents]);

          break;
        case "trim":
          pos -= trim(out);

          break;
        case "group":
          switch (mode) {
            case MODE_FLAT:
              if (!shouldRemeasure) {
                cmds.push([
                  ind,
                  doc.break ? MODE_BREAK : MODE_FLAT,
                  doc.contents,
                ]);

                break;
              }
            // fallthrough

            case MODE_BREAK: {
              shouldRemeasure = false;

              const next = [ind, MODE_FLAT, doc.contents];
              const rem = width - pos;
              const hasLineSuffix = lineSuffix.length > 0;

              if (!doc.break && fits(next, cmds, rem, options, hasLineSuffix)) {
                cmds.push(next);
              } else if (doc.expandedStates) {
                // Expanded states are a rare case where a document
                // can manually provide multiple representations of
                // itself. It provides an array of documents
                // going from the least expanded (most flattened)
                // representation first to the most expanded. If a
                // group has these, we need to manually go through
                // these states and find the first one that fits.
                const mostExpanded =
                  doc.expandedStates[doc.expandedStates.length - 1];

                if (doc.break) {
                  cmds.push([ind, MODE_BREAK, mostExpanded]);

                  break;
                } else {
                  for (let i = 1; i < doc.expandedStates.length + 1; i++) {
                    if (i >= doc.expandedStates.length) {
                      cmds.push([ind, MODE_BREAK, mostExpanded]);

                      break;
                    } else {
                      const state = doc.expandedStates[i];
                      const cmd = [ind, MODE_FLAT, state];

                      if (fits(cmd, cmds, rem, options, hasLineSuffix)) {
                        cmds.push(cmd);

                        break;
                      }
                    }
                  }
                }
              } else {
                cmds.push([ind, MODE_BREAK, doc.contents]);
              }
              break;
            }
          }

          if (doc.id) {
            groupModeMap[doc.id] = cmds[cmds.length - 1][1];
          }
          break;
        // Fills each line with as much code as possible before moving to a new
        // line with the same indentation.
        //
        // Expects doc.parts to be an array of alternating content and
        // whitespace. The whitespace contains the linebreaks.
        //
        // For example:
        //   ["I", line, "love", line, "monkeys"]
        // or
        //   [{ type: group, ... }, softline, { type: group, ... }]
        //
        // It uses this parts structure to handle three main layout cases:
        // * The first two content items fit on the same line without
        //   breaking
        //   -> output the first content item and the whitespace "flat".
        // * Only the first content item fits on the line without breaking
        //   -> output the first content item "flat" and the whitespace with
        //   "break".
        // * Neither content item fits on the line without breaking
        //   -> output the first content item and the whitespace with "break".
        case "fill": {
          const rem = width - pos;

          const { parts } = doc;
          if (parts.length === 0) {
            break;
          }

          const [content, whitespace] = parts;
          const contentFlatCmd = [ind, MODE_FLAT, content];
          const contentBreakCmd = [ind, MODE_BREAK, content];
          const contentFits = fits(
            contentFlatCmd,
            [],
            rem,
            options,
            lineSuffix.length > 0,
            true
          );

          if (parts.length === 1) {
            if (contentFits) {
              cmds.push(contentFlatCmd);
            } else {
              cmds.push(contentBreakCmd);
            }
            break;
          }

          const whitespaceFlatCmd = [ind, MODE_FLAT, whitespace];
          const whitespaceBreakCmd = [ind, MODE_BREAK, whitespace];

          if (parts.length === 2) {
            if (contentFits) {
              cmds.push(whitespaceFlatCmd, contentFlatCmd);
            } else {
              cmds.push(whitespaceBreakCmd, contentBreakCmd);
            }
            break;
          }

          // At this point we've handled the first pair (context, separator)
          // and will create a new fill doc for the rest of the content.
          // Ideally we wouldn't mutate the array here but copying all the
          // elements to a new array would make this algorithm quadratic,
          // which is unusable for large arrays (e.g. large texts in JSX).
          parts.splice(0, 2);
          const remainingCmd = [ind, mode, fill(parts)];

          const secondContent = parts[0];

          const firstAndSecondContentFlatCmd = [
            ind,
            MODE_FLAT,
            concat([content, whitespace, secondContent]),
          ];
          const firstAndSecondContentFits = fits(
            firstAndSecondContentFlatCmd,
            [],
            rem,
            options,
            lineSuffix.length > 0,
            true
          );

          if (firstAndSecondContentFits) {
            cmds.push(remainingCmd, whitespaceFlatCmd, contentFlatCmd);
          } else if (contentFits) {
            cmds.push(remainingCmd, whitespaceBreakCmd, contentFlatCmd);
          } else {
            cmds.push(remainingCmd, whitespaceBreakCmd, contentBreakCmd);
          }
          break;
        }
        case "if-break": {
          const groupMode = doc.groupId ? groupModeMap[doc.groupId] : mode;
          if (groupMode === MODE_BREAK && doc.breakContents) {
            cmds.push([ind, mode, doc.breakContents]);
          }
          if (groupMode === MODE_FLAT && doc.flatContents) {
            cmds.push([ind, mode, doc.flatContents]);
          }

          break;
        }
        case "line-suffix":
          lineSuffix.push([ind, mode, doc.contents]);
          break;
        case "line-suffix-boundary":
          if (lineSuffix.length > 0) {
            cmds.push([ind, mode, { type: "line", hard: true }]);
          }
          break;
        case "line":
          switch (mode) {
            case MODE_FLAT:
              if (!doc.hard) {
                if (!doc.soft) {
                  out.push(" ");

                  pos += 1;
                }

                break;
              } else {
                // This line was forced into the output even if we
                // were in flattened mode, so we need to tell the next
                // group that no matter what, it needs to remeasure
                // because the previous measurement didn't accurately
                // capture the entire expression (this is necessary
                // for nested groups)
                shouldRemeasure = true;
              }
            // fallthrough

            case MODE_BREAK:
              if (lineSuffix.length > 0) {
                cmds.push([ind, mode, doc], ...lineSuffix.reverse());
                lineSuffix = [];
                break;
              }

              if (doc.literal) {
                if (ind.root) {
                  out.push(newLine, ind.root.value);
                  pos = ind.root.length;
                } else {
                  out.push(newLine);
                  pos = 0;
                }
              } else {
                pos -= trim(out);
                out.push(newLine + ind.value);
                pos = ind.length;
              }
              break;
          }
          break;
        default:
      }
    }

    // Flush remaining line-suffix contents at the end of the document, in case
    // there is no new line after the line-suffix.
    if (cmds.length === 0 && lineSuffix.length > 0) {
      cmds.push(...lineSuffix.reverse());
      lineSuffix = [];
    }
  }

  const cursorPlaceholderIndex = out.indexOf(cursor.placeholder);
  if (cursorPlaceholderIndex !== -1) {
    const otherCursorPlaceholderIndex = out.indexOf(
      cursor.placeholder,
      cursorPlaceholderIndex + 1
    );
    const beforeCursor = out.slice(0, cursorPlaceholderIndex).join("");
    const aroundCursor = out
      .slice(cursorPlaceholderIndex + 1, otherCursorPlaceholderIndex)
      .join("");
    const afterCursor = out.slice(otherCursorPlaceholderIndex + 1).join("");

    return {
      formatted: beforeCursor + aroundCursor + afterCursor,
      cursorNodeStart: beforeCursor.length,
      cursorNodeText: aroundCursor,
    };
  }

  return { formatted: out.join("") };
}

module.exports = { printDocToString };
