#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const execa = require("execa");

const CSPELL_CONFIG_FILE = path.join(__dirname, "../cspell.json");

const updateConfig = (config) =>
  fs.writeFileSync(CSPELL_CONFIG_FILE, JSON.stringify(config, undefined, 4));

(async () => {
  console.log("Empty words ...");
  const config = JSON.parse(fs.readFileSync(CSPELL_CONFIG_FILE, "utf8"));
  updateConfig({ ...config, words: [] });

  console.log("Running spellcheck with empty words ...");
  try {
    await execa("yarn lint:spellcheck");
  } catch ({ stdout }) {
    let words = [...stdout.matchAll(/ - Unknown word \((.*?)\)/g)].map(
      ([, word]) => word
    );
    // Unique
    words = [...new Set(words)];
    // Remove upper case word, if lower case one already exists
    words = words.filter((word) => {
      const lowerCased = word.toLowerCase();
      return lowerCased === word || !words.includes(lowerCased);
    });
    // Compare function from https://github.com/streetsidesoftware/vscode-spell-checker/blob/2fde3bc5c658ee51da5a56580aa1370bf8174070/packages/client/src/settings/CSpellSettings.ts#L78
    words = words.sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    config.words = words;
  }

  console.log("Updating words ...");
  updateConfig(config);

  console.log("Running spellcheck with new words ...");
  const subprocess = execa("yarn lint:spellcheck");
  subprocess.stdout.pipe(process.stdout);
  await subprocess;

  console.log("CSpell config file updated.");
})();
