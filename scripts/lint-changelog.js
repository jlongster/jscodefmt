"use strict";
const fs = require("fs");
const path = require("path");

const CHANGELOG_DIR = "changelog_unreleased";
const TEMPLATE_FILE = "TEMPLATE.md";
const CHANGELOG_CATEGORIES = [
  "angular",
  "api",
  "cli",
  "css",
  "flow",
  "graphql",
  "handlebars",
  "html",
  "javascript",
  "json",
  "less",
  "lwc",
  "markdown",
  "mdx",
  "scss",
  "typescript",
  "vue",
  "yaml"
];
const CHANGELOG_ROOT = path.join(__dirname, `../${CHANGELOG_DIR}`);
const showErrorMessage = message => {
  console.error(message);
  process.exitCode = 1;
};

const files = fs.readdirSync(CHANGELOG_ROOT);
for (const file of files) {
  if (file !== TEMPLATE_FILE && !CHANGELOG_CATEGORIES.includes(file)) {
    showErrorMessage(`Please remove "${file}" from "${CHANGELOG_DIR}".`);
  }
}
for (const file of [TEMPLATE_FILE, ...CHANGELOG_CATEGORIES]) {
  if (!files.includes(file)) {
    showErrorMessage(`Please don't remove "${file}" from "${CHANGELOG_DIR}".`);
  }
}

const authorRegex = /by \[@(.*?)\]\(https:\/\/github\.com\/\1\)/;

const template = fs.readFileSync(
  path.join(CHANGELOG_ROOT, TEMPLATE_FILE),
  "utf8"
);
const templateComment = template.match(/<!--[\s\S]*?-->/)[0];
const templateAuthorLink = template.match(authorRegex)[0];

for (const category of CHANGELOG_CATEGORIES) {
  const files = fs.readdirSync(path.join(CHANGELOG_ROOT, category));
  if (!files.includes(".gitkeep")) {
    showErrorMessage(
      `Please don't remove ".gitkeep" from "${CHANGELOG_DIR}/${category}".`
    );
  }

  for (const prFile of files) {
    if (prFile === ".gitkeep") {
      continue;
    }

    const match = prFile.match(/^pr-(\d{4,})\.md$/);
    const displayPath = `${CHANGELOG_DIR}/${category}/${prFile}`;

    if (!match) {
      showErrorMessage(
        `[${displayPath}]: Filename is not in form of "pr-{PR_NUMBER}.md".`
      );
      continue;
    }
    const prNumber = match[1];
    const content = fs.readFileSync(
      path.join(CHANGELOG_DIR, category, prFile),
      "utf8"
    );
    const prLink = `[#${prNumber}](https://github.com/prettier/prettier/pull/${prNumber})`;

    if (!content.includes(prLink)) {
      showErrorMessage(`[${displayPath}]: PR link "${prLink}" is missing.`);
    }
    if (!authorRegex.test(content)) {
      showErrorMessage(`[${displayPath}]: Author link is missing.`);
    }
    if (content.includes(templateComment)) {
      showErrorMessage(
        `[${displayPath}]: Please remove template comments at top.`
      );
    }
    if (content.includes(templateAuthorLink)) {
      showErrorMessage(
        `[${displayPath}]: Please change author link to your github account.`
      );
    }
  }
}
