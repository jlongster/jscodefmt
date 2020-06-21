"use strict";

const prettier = require("prettier/local");
const runPrettier = require("../runPrettier");

test("API getSupportInfo()", () => {
  expect(getCoreInfo()).toMatchSnapshot();
});

describe("CLI --support-info", () => {
  runPrettier("cli", "--support-info").test({ status: 0 });
});

function getCoreInfo() {
  const supportInfo = prettier.getSupportInfo();
  const languages = supportInfo.languages.reduce(
    (obj, language) => ({ [language.name]: language.parsers, ...obj }),
    {}
  );
  const options = supportInfo.options.reduce(
    (obj, option) => ({
      [option.name]: {
        type: option.type,
        default: option.default,
        ...(option.type === "int"
          ? { range: option.range }
          : option.type === "choice"
          ? { choices: option.choices.map((choice) => choice.value) }
          : null),
      },
      ...obj,
    }),
    {}
  );
  return { languages, options };
}
