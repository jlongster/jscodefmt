#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const semver = require("semver");

const changelogUnreleasedDir = path.join(__dirname, "../changelog_unreleased");
const blogDir = path.join(__dirname, "../website/blog");
const introTemplateFile = path.join(
  changelogUnreleasedDir,
  "BLOG_POST_INTRO_TEMPLATE.md"
);
const introFile = path.join(changelogUnreleasedDir, "blog-post-intro.md");
if (!fs.existsSync(introFile)) {
  fs.copyFileSync(introTemplateFile, introFile);
}
const previousVersion = require("prettier/package.json").version;
const version = require("../package.json").version.replace(/-.+/, "");
const postGlob = path.join(blogDir, `????-??-??-${version}.md`);
const postFile = path.join(
  blogDir,
  `${new Date().toISOString().replace(/T.+/, "")}-${version}.md`
);

const categories = [
  { dir: "javascript", title: "JavaScript" },
  { dir: "typescript", title: "TypeScript" },
  { dir: "flow", title: "Flow" },
  { dir: "json", title: "JSON" },
  { dir: "css", title: "CSS" },
  { dir: "scss", title: "SCSS" },
  { dir: "less", title: "Less" },
  { dir: "html", title: "HTML" },
  { dir: "vue", title: "Vue" },
  { dir: "angular", title: "Angular" },
  { dir: "lwc", title: "LWC" },
  { dir: "handlebars", title: "Handlebars (alpha)" },
  { dir: "graphql", title: "GraphQL" },
  { dir: "markdown", title: "Markdown" },
  { dir: "mdx", title: "MDX" },
  { dir: "yaml", title: "YAML" },
  { dir: "api", title: "API" },
  { dir: "cli", title: "CLI" },
];

const categoriesByDir = categories.reduce((result, category) => {
  result[category.dir] = category;
  return result;
}, {});

const dirs = fs
  .readdirSync(changelogUnreleasedDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory());

for (const dir of dirs) {
  const dirPath = path.join(changelogUnreleasedDir, dir.name);
  const category = categoriesByDir[dir.name];

  if (!category) {
    throw new Error(`Unknown category: ${dir.name}`);
  }

  category.entries = fs
    .readdirSync(dirPath)
    .filter((fileName) => /^\d+\.md$/.test(fileName))
    .map((fileName) => {
      const [title, ...rest] = fs
        .readFileSync(path.join(dirPath, fileName), "utf8")
        .trim()
        .split("\n");
      return {
        breaking: title.includes("[BREAKING]"),
        highlight: title.includes("[HIGHLIGHT]"),
        content: [processTitle(title), ...rest].join("\n"),
      };
    });
}

rimraf.sync(postGlob);

fs.writeFileSync(
  postFile,
  replaceVersions(
    `${[
      fs.readFileSync(introFile, "utf8").trim(),
      "<!--truncate-->",
      ...printEntries({
        title: "Highlights",
        filter: (entry) => entry.highlight,
      }),
      ...printEntries({
        title: "Breaking changes",
        filter: (entry) => entry.breaking && !entry.highlight,
      }),
      ...printEntries({
        title: "Other changes",
        filter: (entry) => !entry.breaking && !entry.highlight,
      }),
    ].join("\n\n")}\n`
  )
);

function processTitle(title) {
  return title
    .replace(/\[(BREAKING|HIGHLIGHT)]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^#{4} [a-z]/, (s) => s.toUpperCase())
    .replace(/(?<![[`])@([\w-]+)/g, "[@$1](https://github.com/$1)")
    .replace(
      /(?<![[`])#(\d{4,})/g,
      "[#$1](https://github.com/prettier/prettier/pull/$1)"
    );
}

function printEntries({ title, filter }) {
  const result = [];

  for (const { entries = [], title } of categories) {
    const filteredEntries = entries.filter(filter);
    if (filteredEntries.length > 0) {
      result.push(
        `### ${title}`,
        ...filteredEntries.map((entry) => entry.content)
      );
    }
  }

  if (result.length > 0) {
    result.unshift(`## ${title}`);
  }

  return result;
}

function formatVersion(version) {
  return `${semver.major(version)}.${semver.minor(version)}`;
}

function replaceVersions(data) {
  return data
    .replace(/prettier stable/gi, `Prettier ${formatVersion(previousVersion)}`)
    .replace(/prettier main/gi, `Prettier ${formatVersion(version)}`);
}
