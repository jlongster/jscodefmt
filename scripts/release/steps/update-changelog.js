"use strict";

const fs = require("fs");
const chalk = require("chalk");
const { outdent, string: outdentString } = require("outdent");
const semver = require("semver");
const { waitForEnter, runYarn, logPromise } = require("../utils");

function getBlogPostInfo(version) {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return {
    file: `website/blog/${year}-${month}-${day}-${version}.md`,
    path: `blog/${year}/${month}/${day}/${version}.html`,
  };
}

function writeChangelog({ version, previousVersion, releaseNotes }) {
  const changelog = fs.readFileSync("CHANGELOG.md", "utf-8");
  const newEntry = outdent`
    # ${version}

    [diff](https://github.com/prettier/prettier/compare/${previousVersion}...${version})

    ${releaseNotes}
  `;
  fs.writeFileSync("CHANGELOG.md", `${newEntry}\n\n${changelog}`);
}

module.exports = async function ({ version, previousVersion }) {
  const semverDiff = semver.diff(version, previousVersion);

  if (semverDiff !== "patch") {
    const blogPost = getBlogPostInfo(version);
    writeChangelog({
      version,
      previousVersion,
      releaseNotes: `🔗 [Release Notes](https://prettier.io/${blogPost.path})`,
    });
    if (fs.existsSync(blogPost.file)) {
      // Everything is fine, this step is finished
      return;
    }
    console.warn(
      outdentString(chalk`
        {yellow warning} The file {bold ${blogPost.file}} doesn't exist, but it will be referenced in {bold CHANGELOG.md}. Make sure to create it later.

        Press ENTER to continue.
      `)
    );
  } else {
    console.log(
      outdentString(chalk`
        {yellow.bold A manual step is necessary.}

        You can copy the entries from {bold changelog_unreleased/*/*.md} to {bold CHANGELOG.md}
        and update it accordingly.

        You don't need to commit the file, the script will take care of that.

        When you're finished, press ENTER to continue.
      `)
    );
  }

  await waitForEnter();
  await logPromise(
    "Re-running Prettier on docs",
    runYarn(["lint:prettier", "--write"])
  );
};
