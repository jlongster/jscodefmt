"use strict";

const fs = require("fs");
const flowParser = require("flow-parser");
const globby = require("globby");
const path = require("path");
const rimraf = require("rimraf");

const DEFAULT_SPEC_CONTENT = "run_spec(__dirname);\n";
const SPEC_FILE_NAME = "jsfmt.spec.js";
const FLOW_TESTS_DIR = path.join(__dirname, "..", "tests", "flow-repo");

function tryParse(file, content) {
  const ast = flowParser.parse(content, {
    esproposal_class_instance_fields: true,
    esproposal_class_static_fields: true,
    esproposal_export_star_as: true,
  });

  if (ast.errors.length > 0) {
    const { line, column } = ast.errors[0].loc.start;
    const { message } = ast.errors[0];
    return `${file}:${line}:${column}: ${message}`;
  }

  return null;
}

function syncTests(syncDir) {
  const specFiles = globby.sync(
    path.join(FLOW_TESTS_DIR, "**", SPEC_FILE_NAME)
  );
  const filesToCopy = globby.sync(path.join(syncDir, "**/*.js"));

  if (filesToCopy.length === 0) {
    throw new Error(
      [
        "Couldn't find any files to copy.",
        `Please make sure that \`${syncDir}\` exists and contains the flow tests.`,
      ].join("\n")
    );
  }

  const specContents = specFiles.reduce((obj, specFile) => {
    obj[specFile] = fs.readFileSync(specFile, "utf8");
    return obj;
  }, {});

  const skipped = [];

  rimraf.sync(FLOW_TESTS_DIR);

  filesToCopy.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    const parseError = tryParse(file, content);

    if (parseError) {
      skipped.push(parseError);
      return;
    }

    const newFile = path.join(FLOW_TESTS_DIR, path.relative(syncDir, file));
    const dirname = path.dirname(newFile);
    const specFile = path.join(dirname, SPEC_FILE_NAME);
    const specContent = specContents[specFile] || DEFAULT_SPEC_CONTENT;

    fs.mkdirSync(dirname, { recursive: true });
    fs.writeFileSync(newFile, content);
    fs.writeFileSync(specFile, specContent);
  });

  return skipped;
}

function run(argv) {
  if (argv.length !== 1) {
    console.error(
      [
        "You must provide the path to a flow tests directory to sync from!",
        "Example: node scripts/sync-flow-tests.js ../flow/tests/",
      ].join("\n")
    );
    return 1;
  }

  const syncDir = argv[0];
  let skipped = [];

  try {
    skipped = syncTests(syncDir);
  } catch (error) {
    console.error(`Failed to sync.\n${error}`);
    return 1;
  }

  if (skipped.length > 0) {
    console.log(
      [
        "Some files were skipped due to syntax errors.",
        "This is expected since flow tests for handling invalid code,",
        "but that's not interesting for Prettier's tests.",
        "This is the skipped stuff:",
        "",
      ]
        .concat(skipped, "")
        .join("\n")
    );
  }

  console.log(
    [
      "Done syncing! Now you need to:",
      "",
      `1. Optional: Adjust some ${SPEC_FILE_NAME} files.`,
      "2. Run `jest -u` to create snapshots.",
      "3. Run `git diff` to check how tests and snapshots have changed",
      "4. Take a look at new snapshots to see if they're OK.",
    ].join("\n")
  );

  return 0;
}

if (require.main === module) {
  const exitCode = run(process.argv.slice(2));
  process.exit(exitCode);
}
