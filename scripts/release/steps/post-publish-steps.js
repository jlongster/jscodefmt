"use strict";

const chalk = require("chalk");
const { string: outdentString } = require("outdent");
const fetch = require("node-fetch");
const execa = require("execa");
const { logPromise } = require("../utils");

const SCHEMA_REPO = "SchemaStore/schemastore";
const SCHEMA_PATH = "src/schemas/json/prettierrc.json";
const RAW_URL = `https://raw.githubusercontent.com/${SCHEMA_REPO}/master/${SCHEMA_PATH}`;
const EDIT_URL = `https://github.com/${SCHEMA_REPO}/edit/master/${SCHEMA_PATH}`;

// Any optional or manual step can be warned in this script.

async function checkSchema() {
  const schema = await execa.stdout("node", ["scripts/generate-schema.js"]);
  const remoteSchema = await logPromise(
    "Checking current schema in SchemaStore",
    fetch(RAW_URL)
      .then((r) => r.text())
      .then((t) => t.trim())
  );

  if (schema === remoteSchema) {
    return;
  }

  return outdentString(chalk`
    {bold.underline The schema in {yellow SchemaStore} needs an update.}
    - Open {cyan.underline ${EDIT_URL}}
    - Run {yellow node scripts/generate-schema.js} and copy the new schema
    - Paste it on GitHub interface
    - Open a PR
  `);
}

function twitterAnnouncement() {
  return outdentString(chalk`
    {bold.underline Announce on Twitter}
    - Open {cyan.underline https://tweetdeck.twitter.com}
    - Make sure you are tweeting from the {yellow @PrettierCode} account.
    - Tweet about the release, including the blog post URL.
  `);
}

module.exports = async function () {
  const steps = [await checkSchema(), twitterAnnouncement()].filter(Boolean);

  console.log(chalk.bold.green("The script has finished!\n"));

  if (steps.length === 0) {
    return;
  }

  console.log(
    outdentString(chalk`
      {yellow.bold The following ${
        steps.length === 1 ? "step is" : "steps are"
      } optional.}

      ${steps.join("\n\n")}
    `)
  );
};
