"use strict";

const path = require("path");
const fs = require("fs");
const tempy = require("tempy");
const fromPairs = require("lodash/fromPairs");

const prettier = require("prettier-local");
const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("extracts file-info for a js file", () => {
  runPrettier("cli/", ["--file-info", "something.js"]).test({
    status: 0,
  });
});

describe("extracts file-info for a markdown file", () => {
  runPrettier("cli/", ["--file-info", "README.md"]).test({
    status: 0,
  });
});

describe("extracts file-info for a known markdown file with no extension", () => {
  runPrettier("cli/", ["--file-info", "README"]).test({
    status: 0,
  });
});

describe("extracts file-info with ignored=true for a file in .prettierignore", () => {
  runPrettier("cli/ignore-path/", ["--file-info", "regular-module.js"]).test({
    status: 0,
  });
});

describe("file-info should try resolve config", () => {
  runPrettier("cli/with-resolve-config/", ["--file-info", "file.js"]).test({
    status: 0,
  });
});

describe("file-info should not try resolve config with --no-config", () => {
  runPrettier("cli/with-resolve-config/", [
    "--file-info",
    "file.js",
    "--no-config",
  ]).test({
    status: 0,
    stderr: "",
    write: [],
  });
});

describe("extracts file-info with ignored=true for a file in a hand-picked .prettierignore", () => {
  runPrettier("cli/ignore-path/", [
    "--file-info",
    "regular-module.js",
    "--ignore-path=.prettierignore",
  ]).test({
    status: 0,
  });
});

describe("Should not ignore files in parent dir", () => {
  runPrettier("cli/", [
    "--file-info",
    "regular-module.js",
    "--ignore-path=ignore-path/.prettierignore",
  ]).test({
    status: 0,
  });
});

describe("non-exists ignore path", () => {
  runPrettier("cli/", [
    "--file-info",
    "regular-module.js",
    "--ignore-path=ignore-path/non-exists/.prettierignore",
  ]).test({
    status: 0,
  });
});

describe("extracts file-info for a file in not_node_modules", () => {
  runPrettier("cli/with-node-modules/", [
    "--file-info",
    "not_node_modules/file.js",
  ]).test({
    status: 0,
  });
});

describe("extracts file-info with with ignored=true for a file in node_modules", () => {
  runPrettier("cli/with-node-modules/", [
    "--file-info",
    "node_modules/file.js",
  ]).test({
    status: 0,
  });
});

describe("extracts file-info with ignored=false for a file in node_modules when --with-node-modules provided", () => {
  runPrettier("cli/with-node-modules/", [
    "--file-info",
    "node_modules/file.js",
    "--with-node-modules",
  ]).test({
    status: 0,
  });
});

describe("extracts file-info with inferredParser=null for file.foo", () => {
  runPrettier("cli/", ["--file-info", "file.foo"]).test({
    status: 0,
  });
});

describe("extracts file-info with inferredParser=foo when plugins are autoloaded", () => {
  runPrettier("plugins/automatic/", ["--file-info", "file.foo"]).test({
    status: 0,
  });
});

describe("extracts file-info with inferredParser=foo when plugins are loaded with --plugin-search-dir", () => {
  runPrettier("cli/", [
    "--file-info",
    "file.foo",
    "--plugin-search-dir",
    "../plugins/automatic",
  ]).test({
    status: 0,
  });
});

describe("extracts file-info with inferredParser=foo when a plugin is hand-picked", () => {
  runPrettier("cli/", [
    "--file-info",
    "file.foo",
    "--plugin",
    "../plugins/automatic/node_modules/@prettier/plugin-foo",
  ]).test({
    status: 0,
  });
});

test("API getFileInfo with no args", async () => {
  await expect(prettier.getFileInfo()).rejects.toThrow(
    new TypeError("expect `filePath` to be a string, got `undefined`")
  );
});

test("API getFileInfo.sync with no args", () => {
  expect(() => prettier.getFileInfo.sync()).toThrow(
    new TypeError("expect `filePath` to be a string, got `undefined`")
  );
});

test("API getFileInfo with filepath only", async () => {
  await expect(prettier.getFileInfo("README")).resolves.toMatchObject({
    ignored: false,
    inferredParser: "markdown",
  });
});

test("API getFileInfo.sync with filepath only", () => {
  expect(prettier.getFileInfo.sync("README")).toMatchObject({
    ignored: false,
    inferredParser: "markdown",
  });
});

describe("API getFileInfo resolveConfig", () => {
  const files = fromPairs(
    ["foo", "js", "bar", "css"].map((ext) => [
      ext,
      path.resolve(
        path.join(__dirname, `../cli/with-resolve-config/file.${ext}`)
      ),
    ])
  );
  test("{resolveConfig: undefined}", async () => {
    await expect(prettier.getFileInfo(files.foo)).resolves.toMatchObject({
      ignored: false,
      inferredParser: null,
    });
    await expect(prettier.getFileInfo(files.js)).resolves.toMatchObject({
      ignored: false,
      inferredParser: "babel",
    });
    await expect(prettier.getFileInfo(files.bar)).resolves.toMatchObject({
      ignored: false,
      inferredParser: null,
    });
    await expect(prettier.getFileInfo(files.css)).resolves.toMatchObject({
      ignored: false,
      inferredParser: "css",
    });
  });
  test("{resolveConfig: true}", async () => {
    await expect(
      prettier.getFileInfo(files.foo, { resolveConfig: true })
    ).resolves.toMatchObject({
      ignored: false,
      inferredParser: "foo-parser",
    });
    await expect(
      prettier.getFileInfo(files.js, { resolveConfig: true })
    ).resolves.toMatchObject({
      ignored: false,
      inferredParser: "override-js-parser",
    });
    await expect(
      prettier.getFileInfo(files.bar, { resolveConfig: true })
    ).resolves.toMatchObject({
      ignored: false,
      inferredParser: null,
    });
    await expect(
      prettier.getFileInfo(files.css, { resolveConfig: true })
    ).resolves.toMatchObject({
      ignored: false,
      inferredParser: "css",
    });
  });
  test("sync {resolveConfig: undefined}", () => {
    expect(prettier.getFileInfo.sync(files.foo)).toMatchObject({
      ignored: false,
      inferredParser: null,
    });
    expect(prettier.getFileInfo.sync(files.js)).toMatchObject({
      ignored: false,
      inferredParser: "babel",
    });
    expect(prettier.getFileInfo.sync(files.bar)).toMatchObject({
      ignored: false,
      inferredParser: null,
    });
    expect(prettier.getFileInfo.sync(files.css)).toMatchObject({
      ignored: false,
      inferredParser: "css",
    });
  });
  test("sync {resolveConfig: true}", () => {
    expect(
      prettier.getFileInfo.sync(files.foo, {
        resolveConfig: true,
      })
    ).toMatchObject({
      ignored: false,
      inferredParser: "foo-parser",
    });
    expect(
      prettier.getFileInfo.sync(files.js, {
        resolveConfig: true,
      })
    ).toMatchObject({
      ignored: false,
      inferredParser: "override-js-parser",
    });
    expect(
      prettier.getFileInfo.sync(files.bar, {
        resolveConfig: true,
      })
    ).toMatchObject({
      ignored: false,
      inferredParser: null,
    });
    expect(
      prettier.getFileInfo.sync(files.css, {
        resolveConfig: true,
      })
    ).toMatchObject({
      ignored: false,
      inferredParser: "css",
    });
  });
});

describe("API getFileInfo resolveConfig when no config is present", () => {
  const files = fromPairs(
    ["foo", "js"].map((ext) => [
      ext,
      path.resolve(path.join(__dirname, `../cli/non-exists-dir/file.${ext}`)),
    ])
  );
  test("{resolveConfig: undefined}", async () => {
    await expect(prettier.getFileInfo(files.foo)).resolves.toMatchObject({
      ignored: false,
      inferredParser: null,
    });
    await expect(prettier.getFileInfo(files.js)).resolves.toMatchObject({
      ignored: false,
      inferredParser: "babel",
    });
  });
  test("{resolveConfig: true}", async () => {
    await expect(
      prettier.getFileInfo(files.foo, { resolveConfig: true })
    ).resolves.toMatchObject({
      ignored: false,
      inferredParser: null,
    });
    await expect(
      prettier.getFileInfo(files.js, { resolveConfig: true })
    ).resolves.toMatchObject({
      ignored: false,
      inferredParser: "babel",
    });
  });
  test("sync {resolveConfig: undefined}", () => {
    expect(prettier.getFileInfo.sync(files.foo)).toMatchObject({
      ignored: false,
      inferredParser: null,
    });
    expect(prettier.getFileInfo.sync(files.js)).toMatchObject({
      ignored: false,
      inferredParser: "babel",
    });
  });
  test("sync {resolveConfig: true}", () => {
    expect(
      prettier.getFileInfo.sync(files.foo, { resolveConfig: true })
    ).toMatchObject({
      ignored: false,
      inferredParser: null,
    });
    expect(
      prettier.getFileInfo.sync(files.js, { resolveConfig: true })
    ).toMatchObject({
      ignored: false,
      inferredParser: "babel",
    });
  });
});

test("API getFileInfo with ignorePath", async () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/ignore-path/regular-module.js")
  );
  const ignorePath = path.resolve(
    path.join(__dirname, "../cli/ignore-path/.prettierignore")
  );

  await expect(prettier.getFileInfo(file)).resolves.toMatchObject({
    ignored: false,
    inferredParser: "babel",
  });

  await expect(
    prettier.getFileInfo(file, { ignorePath })
  ).resolves.toMatchObject({
    ignored: true,
    inferredParser: null,
  });
});

test("API getFileInfo with ignorePath containing relative paths", async () => {
  const file = path.resolve(
    path.join(
      __dirname,
      "../cli/ignore-relative-path/level1-glob/level2-glob/level3-glob/shouldNotBeFormat.js"
    )
  );
  const ignorePath = path.resolve(
    path.join(__dirname, "../cli/ignore-relative-path/.prettierignore")
  );

  await expect(prettier.getFileInfo(file)).resolves.toMatchObject({
    ignored: false,
    inferredParser: "babel",
  });

  await expect(
    prettier.getFileInfo(file, { ignorePath })
  ).resolves.toMatchObject({
    ignored: true,
    inferredParser: null,
  });
});

test("API getFileInfo.sync with ignorePath", () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/ignore-path/regular-module.js")
  );
  const ignorePath = path.resolve(
    path.join(__dirname, "../cli/ignore-path/.prettierignore")
  );

  expect(prettier.getFileInfo.sync(file)).toMatchObject({
    ignored: false,
    inferredParser: "babel",
  });

  expect(
    prettier.getFileInfo.sync(file, {
      ignorePath,
    })
  ).toMatchObject({
    ignored: true,
    inferredParser: null,
  });
});

describe("API getFileInfo.sync with ignorePath", () => {
  let cwd;
  let filePath;
  let options;
  beforeAll(() => {
    cwd = process.cwd();
    const tempDir = tempy.directory();
    process.chdir(tempDir);
    const fileDir = "src";
    filePath = `${fileDir}/should-be-ignored.js`;
    const ignorePath = path.join(tempDir, ".prettierignore");
    fs.writeFileSync(ignorePath, filePath, "utf8");
    options = { ignorePath };
  });
  afterAll(() => {
    process.chdir(cwd);
  });
  test("with relative filePath", () => {
    expect(
      prettier.getFileInfo.sync(filePath, options).ignored
    ).toMatchInlineSnapshot("true");
  });
  test("with relative filePath starts with dot", () => {
    expect(
      prettier.getFileInfo.sync(`./${filePath}`, options).ignored
    ).toMatchInlineSnapshot("true");
  });
  test("with absolute filePath", () => {
    expect(
      prettier.getFileInfo.sync(path.resolve(filePath), options).ignored
    ).toMatchInlineSnapshot("true");
  });
});

test("API getFileInfo with withNodeModules", async () => {
  const file = path.resolve(
    path.join(__dirname, "../cli/with-node-modules/node_modules/file.js")
  );
  await expect(prettier.getFileInfo(file)).resolves.toMatchObject({
    ignored: true,
    inferredParser: null,
  });
  await expect(
    prettier.getFileInfo(file, {
      withNodeModules: true,
    })
  ).resolves.toMatchObject({
    ignored: false,
    inferredParser: "babel",
  });
});

describe("extracts file-info for a JS file with no extension but a standard shebang", () => {
  expect(
    prettier.getFileInfo.sync("tests_integration/cli/shebang/node-shebang")
  ).toMatchObject({
    ignored: false,
    inferredParser: "babel",
  });
});

describe("extracts file-info for a JS file with no extension but an env-based shebang", () => {
  expect(
    prettier.getFileInfo.sync("tests_integration/cli/shebang/env-node-shebang")
  ).toMatchObject({
    ignored: false,
    inferredParser: "babel",
  });
});

describe("returns null parser for unknown shebang", () => {
  expect(
    prettier.getFileInfo.sync("tests_integration/cli/shebang/nonsense-shebang")
  ).toMatchObject({
    ignored: false,
    inferredParser: null,
  });
});

test("API getFileInfo with plugins loaded using pluginSearchDir", async () => {
  const file = "file.foo";
  const pluginsPath = path.resolve(
    path.join(__dirname, "../plugins/automatic")
  );
  await expect(prettier.getFileInfo(file)).resolves.toMatchObject({
    ignored: false,
    inferredParser: null,
  });
  await expect(
    prettier.getFileInfo(file, {
      pluginSearchDirs: [pluginsPath],
    })
  ).resolves.toMatchObject({
    ignored: false,
    inferredParser: "foo",
  });
});

test("API getFileInfo with hand-picked plugins", async () => {
  const file = "file.foo";
  const pluginPath = path.resolve(
    path.join(
      __dirname,
      "../plugins/automatic/node_modules/@prettier/plugin-foo"
    )
  );
  await expect(prettier.getFileInfo(file)).resolves.toMatchObject({
    ignored: false,
    inferredParser: null,
  });
  await expect(
    prettier.getFileInfo(file, {
      plugins: [pluginPath],
    })
  ).resolves.toMatchObject({
    ignored: false,
    inferredParser: "foo",
  });
});

test("API getFileInfo with ignorePath and resolveConfig should infer parser with correct filepath", async () => {
  const dir = path.join(__dirname, "../cli/ignore-and-config/");
  const filePath = path.join(dir, "config-dir/foo");
  const ignorePath = path.join(dir, "ignore-path-dir/.prettierignore");
  const options = {
    resolveConfig: true,
    ignorePath,
  };

  await expect(prettier.getFileInfo(filePath, options)).resolves.toMatchObject({
    ignored: false,
    inferredParser: "parser-for-config-dir",
  });

  expect(prettier.getFileInfo.sync(filePath, options)).toMatchObject({
    ignored: false,
    inferredParser: "parser-for-config-dir",
  });
});
