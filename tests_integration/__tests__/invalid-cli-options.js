"use strict";

const runPrettier = require("../runPrettier");

const unknownOptions = [
  "--unknown",
  "-0",
  // TODO: this should not be a flag
  "---unknown",
];
const assertion = {
  status: 1,
  stdout: "",
  write: [],
};

for (const options of [
  ...unknownOptions.map((option) => [option]),
  unknownOptions,
]) {
  describe(`Exit on unknown options "${options.join(" ")}"}`, () => {
    runPrettier(__dirname, ["foo.js", ...options]).test(assertion);
  });
}

for (const option of ["-no-conf", "--html-whitespace", "--tab"]) {
  describe(`Should suggest right option "${option}"}`, () => {
    runPrettier(__dirname, ["foo.js", option]).test(assertion);
  });
}

for (const option of ["-", "--", "un-known", "un--known"]) {
  describe(`Not unknown option "${option}"`, () => {
    runPrettier(__dirname, ["foo.js", option]).test({
      status: 2,
      stdout: "",
      write: [],
    });
  });
}
