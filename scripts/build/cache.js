"use strict";

const util = require("util");
const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { rollup } = require("rollup");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const ROOT = path.join(__dirname, "..", "..");

function Cache(cacheDir, version) {
  this.cacheDir = path.resolve(cacheDir || required("cacheDir"));
  this.manifest = path.join(this.cacheDir, "manifest.json");
  this.version = version || required("version");
  this.checksums = {};
  this.files = {};
  this.updated = {
    version: this.version,
    checksums: {},
    files: {},
  };
}

// Loads the manifest.json file with the information from the last build
Cache.prototype.load = async function () {
  // This should never throw, if it does, let it fail the build
  const lockfile = await readFile("yarn.lock", "utf-8");
  const lockfileHash = hashString(lockfile);
  this.updated.checksums["yarn.lock"] = lockfileHash;

  try {
    const manifest = await readFile(this.manifest, "utf-8");
    const { version, checksums, files } = JSON.parse(manifest);

    // Ignore the cache if the version changed
    assert.equal(this.version, version);

    assert.ok(typeof checksums === "object");
    // If yarn.lock changed, rebuild everything
    assert.equal(lockfileHash, checksums["yarn.lock"]);
    this.checksums = checksums;

    assert.ok(typeof files === "object");
    this.files = files;

    for (const files of Object.values(this.files)) {
      assert.ok(Array.isArray(files));
    }
  } catch (err) {
    this.checksums = {};
    this.files = {};
  }
};

// Run rollup to get the list of files included in the bundle and check if
// any (or the list itself) have changed.
// This takes the same rollup config used for bundling to include files that are
// resolved by specific plugins.
Cache.prototype.checkBundle = async function (id, inputOptions, outputOptions) {
  const files = new Set(this.files[id]);
  const newFiles = (this.updated.files[id] = []);

  let dirty = false;

  const bundle = await rollup(getRollupConfig(inputOptions));
  const { output } = await bundle.generate(outputOptions);

  const modules = output
    .filter((mod) => !/\0/.test(mod.facadeModuleId))
    .map((mod) => [path.relative(ROOT, mod.facadeModuleId), mod.code]);

  for (const [id, code] of modules) {
    newFiles.push(id);
    // If we already checked this file for another bundle, reuse the hash
    if (!this.updated.checksums[id]) {
      this.updated.checksums[id] = hashString(code);
    }
    const hash = this.updated.checksums[id];

    // Check if this file changed
    if (!this.checksums[id] || this.checksums[id] !== hash) {
      dirty = true;
    }

    // Check if this file is new
    if (!files.delete(id)) {
      dirty = true;
    }
  }

  // Final check: if any file was removed, `files` is not empty
  return !dirty && files.size === 0;
};

Cache.prototype.save = async function () {
  try {
    await writeFile(this.manifest, JSON.stringify(this.updated, null, 2));
  } catch (err) {
    // Don't fail the build
  }
};

function required(name) {
  throw new Error(name + " is required");
}

function hashString(string) {
  return crypto.createHash("md5").update(string).digest("hex");
}

function getRollupConfig(rollupConfig) {
  return {
    ...rollupConfig,
    onwarn() {},
    plugins: rollupConfig.plugins.filter(
      (plugin) =>
        // We're not interested in dependencies, we already check `yarn.lock`
        plugin.name !== "node-resolve" &&
        // This is really slow, we need this "preflight" to be fast
        plugin.name !== "babel"
    ),
  };
}

module.exports = Cache;
