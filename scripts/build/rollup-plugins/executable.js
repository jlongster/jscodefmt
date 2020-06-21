"use strict";

const fs = require("fs");
const path = require("path");

module.exports = function () {
  let banner;
  let entry;
  let file;

  return {
    name: "executable",

    options(inputOptions) {
      entry = path.resolve(inputOptions.input);
    },

    generateBundle(outputOptions) {
      file = outputOptions.file;
    },

    load(id) {
      if (id !== entry) {
        return;
      }
      const source = fs.readFileSync(id, "utf-8");
      const match = source.match(/^\s*(#!.*)/);
      if (match) {
        banner = match[1];
        return (
          source.slice(0, match.index) +
          source.slice(match.index + banner.length)
        );
      }
    },

    renderChunk(code) {
      if (banner) {
        return { code: banner + "\n" + code };
      }
    },

    writeBundle() {
      if (banner && file) {
        fs.chmodSync(file, 0o755 & ~process.umask());
      }
    },
  };
};
