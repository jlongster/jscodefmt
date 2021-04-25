"use strict";

const prettier = require("prettier-local");
const { internalDoc } = prettier.__debug;
const publicDoc = prettier.doc;

test("Doc", () => {
  expect(typeof internalDoc.builders.concat).toBe("undefined");
  expect(typeof publicDoc.builders.concat).toBe("function");
  // eslint-disable-next-line unicorn/prefer-spread
  expect(publicDoc.builders.concat(["foo"]).type).toBe("concat");

  expect(Array.isArray(internalDoc.builders.hardline)).toBe(true);
  expect(publicDoc.builders.hardline.type).toBe("concat");

  expect(Array.isArray(internalDoc.builders.literalline)).toBe(true);
  expect(publicDoc.builders.literalline.type).toBe("concat");

  expect(Array.isArray(internalDoc.builders.join("foo", ["1", "2"]))).toBe(
    true
  );
  expect(publicDoc.builders.join("foo", ["1", "2"]).type).toBe("concat");
});
