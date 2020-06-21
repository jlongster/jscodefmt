"use strict";

const fs = require("fs");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function readJson(file) {
  const data = await readFile(file);
  return JSON.parse(data);
}

function writeJson(file, content) {
  content = JSON.stringify(content, null, 2);
  return writeFile(file, content);
}

async function copyFile(from, to) {
  const data = await readFile(from);
  return writeFile(to, data);
}

module.exports = {
  readJson,
  writeJson,
  copyFile,
  readFile,
  writeFile,
};
