"use strict";

const prettier = require("prettier/local");
const runPrettier = require("../runPrettier");
const constant = require("../../src/cli/constant");
const util = require("../../src/cli/util");
const arrayify = require("../../src/utils/arrayify");

arrayify(
  {
    ...util.createDetailedOptionMap(
      prettier.getSupportInfo({
        showDeprecated: true,
        showUnreleased: true,
        showInternal: true,
      }).options
    ),
    ...util.normalizeDetailedOptionMap(constant.options),
  },
  "name"
).forEach((option) => {
  const optionNames = [
    option.description ? option.name : null,
    option.oppositeDescription ? `no-${option.name}` : null,
  ].filter(Boolean);

  optionNames.forEach((optionName) => {
    describe(`show detailed usage with --help ${optionName}`, () => {
      runPrettier("cli", ["--help", optionName]).test({
        status: 0,
      });
    });
  });
});
