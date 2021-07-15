#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs";
import { outdent } from "outdent";
import createEsmUtils from "esm-utils";
import { CHANGELOG_CATEGORIES } from "./utils/changelog-categories.mjs";

const { __dirname } = createEsmUtils(import.meta);
const CHANGELOG_DIR = "changelog_unreleased";
const TEMPLATE_FILE = "TEMPLATE.md";
const BLOG_POST_INTRO_TEMPLATE_FILE = "BLOG_POST_INTRO_TEMPLATE.md";
const BLOG_POST_INTRO_FILE = "blog-post-intro.md";
const CHANGELOG_ROOT = path.join(__dirname, `../${CHANGELOG_DIR}`);
const showErrorMessage = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const files = fs.readdirSync(CHANGELOG_ROOT);
for (const file of files) {
  if (
    file !== TEMPLATE_FILE &&
    file !== BLOG_POST_INTRO_FILE &&
    file !== BLOG_POST_INTRO_TEMPLATE_FILE &&
    !CHANGELOG_CATEGORIES.includes(file)
  ) {
    showErrorMessage(`Please remove "${file}" from "${CHANGELOG_DIR}".`);
  }
}
for (const file of [
  TEMPLATE_FILE,
  BLOG_POST_INTRO_TEMPLATE_FILE,
  ...CHANGELOG_CATEGORIES,
]) {
  if (!files.includes(file)) {
    showErrorMessage(`Please don't remove "${file}" from "${CHANGELOG_DIR}".`);
  }
}

const authorRegex = /by @[\w-]+|by \[@([\w-]+)]\(https:\/\/github\.com\/\1\)/;
const titleRegex = /^#{4} (.*?)\((#\d{4,}|\[#\d{4,}])/;

const template = fs.readFileSync(
  path.join(CHANGELOG_ROOT, TEMPLATE_FILE),
  "utf8"
);
const [templateComment] = template.match(/<!--.*?-->/s);
const [templateAuthorLink] = template.match(authorRegex);
const checkedFiles = new Map();

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

    const match = prFile.match(/^(\d{4,})\.md$/);
    const displayPath = `${CHANGELOG_DIR}/${category}/${prFile}`;

    if (!match) {
      showErrorMessage(
        `[${displayPath}]: Filename is not in form of "{PR_NUMBER}.md".`
      );
      continue;
    }
    const [, prNumber] = match;
    const prLink = `#${prNumber}`;
    if (checkedFiles.has(prNumber)) {
      showErrorMessage(
        outdent`
          Duplicate files for ${prLink} found.
            - ${checkedFiles.get(prNumber)}
            - ${displayPath}
        `
      );
    }
    checkedFiles.set(prNumber, displayPath);
    const content = fs.readFileSync(
      path.join(CHANGELOG_DIR, category, prFile),
      "utf8"
    );

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
    if (!content.startsWith("#### ")) {
      showErrorMessage(`[${displayPath}]: Please use h4 ("####") for title.`);
    }
    const titleMatch = content.match(titleRegex);
    if (!titleMatch) {
      showErrorMessage(`[${displayPath}]: Something wrong in title.`);
      continue;
    }
    const [, title] = titleMatch;
    const categoryInTitle = title.split(":").shift().trim();
    if (
      [...CHANGELOG_CATEGORIES, "js"].includes(categoryInTitle.toLowerCase())
    ) {
      showErrorMessage(
        `[${displayPath}]: Please remove "${categoryInTitle}:" in title.`
      );
    }

    if (!title.endsWith(" ") || title.length - title.trimEnd().length !== 1) {
      showErrorMessage(
        `[${displayPath}]: Please put one space between title and PR link.`
      );
    }

    if (/prettier master/i.test(content)) {
      showErrorMessage(
        `[${displayPath}]: Please use "main" instead of "master".`
      );
    }
  }
}
