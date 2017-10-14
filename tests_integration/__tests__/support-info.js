"use strict";

const prettier = require("../../tests_config/require_prettier");

describe("API getSupportInfo()", () => {
  test("no arguments", () => {
    expect(prettier.getSupportInfo()).toMatchSnapshot();
  });

  const testVersions = ["0.0.0", "1.0.0", "1.4.0", "1.5.0", "1.7.1", "1.8.0"];

  testVersions.forEach(version => {
    test(`with version ${version}`, () => {
      expect(prettier.getSupportInfo(version)).toMatchSnapshot();
    });
  });
});
