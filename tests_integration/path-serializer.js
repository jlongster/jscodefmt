"use strict";

const normalizePath = require("../src/utils/normalize-path");
const cwd = process.cwd();

const variants = (/^[a-z]:\\/i.test(cwd)
  ? [
      cwd.charAt(0).toLowerCase() + cwd.slice(1),
      cwd.charAt(0).toUpperCase() + cwd.slice(1),
    ]
  : [cwd]
).map((variant) => normalizePath(variant));

const replaceCWD = (text) => {
  for (const variant of variants) {
    while (text.includes(variant)) {
      text = text.replace(variant, "<cwd>");
    }
  }

  return text;
};

module.exports = {
  test: (value) =>
    typeof value === "string" &&
    variants.some((variant) => value.includes(variant)),
  print: (value, serializer) => serializer(replaceCWD(value)),
};
