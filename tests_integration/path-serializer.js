"use strict";

const replaceCWD = (text) => {
  const cwd = process.cwd();

  const variants = /^[a-z]:\\/i.test(cwd)
    ? [
        cwd.charAt(0).toLowerCase() + cwd.slice(1),
        cwd.charAt(0).toUpperCase() + cwd.slice(1),
      ]
    : [cwd];

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
    (value.includes("\\") || value.includes(process.cwd())),
  print: (value, serializer) =>
    serializer(replaceCWD(value).replace(/\\/g, "/")),
};
