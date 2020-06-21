"use strict";

const chalk = require("chalk");
const execa = require("execa");
const minimist = require("minimist");
const path = require("path");
const fs = require("fs");
const stringWidth = require("string-width");

const bundler = require("./bundler");
const bundleConfigs = require("./config");
const util = require("./util");
const Cache = require("./cache");

// Errors in promises should be fatal.
const loggedErrors = new Set();
process.on("unhandledRejection", (err) => {
  // No need to print it twice.
  if (!loggedErrors.has(err)) {
    console.error(err);
  }
  process.exit(1);
});

const CACHE_VERSION = "v24"; // This need update when updating build scripts
const CACHED = chalk.bgYellow.black(" CACHED ");
const OK = chalk.bgGreen.black("  DONE  ");
const FAIL = chalk.bgRed.black("  FAIL  ");

function fitTerminal(input) {
  const columns = Math.min(process.stdout.columns || 40, 80);
  const WIDTH = columns - stringWidth(OK) + 1;
  if (input.length < WIDTH) {
    input += chalk.dim(".").repeat(WIDTH - input.length - 1);
  }
  return input;
}

async function createBundle(bundleConfig, cache) {
  const { output, target } = bundleConfig;
  process.stdout.write(fitTerminal(output));

  try {
    const { cached } = await bundler(bundleConfig, cache);

    if (cached) {
      console.log(CACHED);
      return;
    }

    // Files including U+FFEE can't load in Chrome Extension
    // `prettier-chrome-extension` https://github.com/prettier/prettier-chrome-extension
    // details https://github.com/prettier/prettier/pull/8534
    if (target === "universal") {
      const file = path.join("dist", output);
      const content = fs.readFileSync(file, "utf8");
      if (content.includes("\ufffe")) {
        throw new Error("Bundled umd file should not have U+FFFE character.");
      }
    }

    console.log(OK);
  } catch (error) {
    console.log(FAIL + "\n");
    handleError(error);
  }
}

function handleError(error) {
  loggedErrors.add(error);
  console.error(error);
  throw error;
}

async function cacheFiles() {
  // Copy built files to .cache
  try {
    await execa("rm", ["-rf", path.join(".cache", "files")]);
    await execa("mkdir", ["-p", path.join(".cache", "files")]);
    for (const bundleConfig of bundleConfigs) {
      await execa("cp", [
        path.join("dist", bundleConfig.output),
        path.join(".cache", "files"),
      ]);
    }
  } catch (err) {
    // Don't fail the build
  }
}

async function preparePackage() {
  const pkg = await util.readJson("package.json");
  pkg.bin = "./bin-prettier.js";
  delete pkg.dependencies;
  delete pkg.devDependencies;
  pkg.scripts = {
    prepublishOnly:
      "node -e \"assert.equal(require('.').version, require('..').version)\"",
  };
  pkg.files = ["*.js"];
  await util.writeJson("dist/package.json", pkg);

  await util.copyFile("./README.md", "./dist/README.md");
  await util.copyFile("./LICENSE", "./dist/LICENSE");
}

async function run(params) {
  await execa("rm", ["-rf", "dist"]);
  await execa("mkdir", ["-p", "dist"]);

  if (params["purge-cache"]) {
    await execa("rm", ["-rf", ".cache"]);
  }

  const bundleCache = new Cache(".cache/", CACHE_VERSION);
  await bundleCache.load();

  console.log(chalk.inverse(" Building packages "));
  for (const bundleConfig of bundleConfigs) {
    await createBundle(bundleConfig, bundleCache);
  }

  await cacheFiles();
  await bundleCache.save();

  await preparePackage();
}

run(
  minimist(process.argv.slice(2), {
    boolean: ["purge-cache"],
  })
);
