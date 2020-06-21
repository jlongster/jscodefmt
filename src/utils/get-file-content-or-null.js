"use strict";

const fs = require("fs");

/**
 * @param {string} filename
 * @returns {Promise<null | string>}
 */
function getFileContentOrNull(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, "utf8", (error, data) => {
      if (error && error.code !== "ENOENT") {
        reject(createError(filename, error));
      } else {
        resolve(error ? null : data);
      }
    });
  });
}

/**
 * @param {string} filename
 * @returns {null | string}
 */
getFileContentOrNull.sync = function (filename) {
  try {
    return fs.readFileSync(filename, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return null;
    }
    throw createError(filename, error);
  }
};

function createError(filename, error) {
  return new Error(`Unable to read ${filename}: ${error.message}`);
}

module.exports = getFileContentOrNull;
