"use strict";

const prettier = require("prettier-local");
const docBuilders = prettier.__debug.internalDoc.builders;
const docUtils = prettier.__debug.internalDoc.utils;

const { cleanDoc } = docUtils;
const { group, align, indent, lineSuffix, ifBreak, fill } = docBuilders;
const { concat } = prettier.doc.builders;

describe("cleanDoc", () => {
  test.each([
    [
      "fill",
      concat([fill(["", ""]), fill([]), fill(["1"]), fill(["2", "3"])]),
      concat([fill(["1"]), fill(["2", "3"])]),
    ],
    ["nested group", group(group("_")), group("_")],
    [
      "empty group",
      concat([
        group(""),
        group(concat([""])),
        group("_", { id: "id" }),
        group("_", { shouldBreak: true }),
        group("_", { expandedStates: ["_"] }),
      ]),
      concat([
        group("_", { id: "id" }),
        group("_", { shouldBreak: true }),
        group("_", { expandedStates: ["_"] }),
      ]),
    ],
    [
      "removes empty align/indent/line-suffix",
      concat([
        group(
          concat([
            align("  ", concat([""])),
            indent(concat([""])),
            concat([""]),
            "",
            lineSuffix(concat([""])),
            ifBreak("", concat([""])),
          ])
        ),
        "_",
      ]),
      "_",
    ],
    [
      "removes empty string/concat",
      concat(["", concat(["", concat([concat(["", "_", ""]), ""])]), ""]),
      "_",
    ],
    [
      "concat string & flat concat",
      group(
        concat([
          group("1"),
          concat(["2", "3", group("4"), "5", "6"]),
          concat(["7", "8", group("9"), "10", "11"]),
        ])
      ),
      group(concat([group("1"), "23", group("4"), "5678", group("9"), "1011"])),
    ],
  ])("%s", (_, doc, expected) => {
    const result = cleanDoc(doc);

    expect(result).toEqual(expected);
  });
});
