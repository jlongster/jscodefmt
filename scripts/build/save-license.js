"use strict";

const fs = require("fs");
const path = require("path");
const { outdent } = require("outdent");
const file = path.join(__dirname, "../../dist/LICENSE");
const separator = `\n${"-".repeat(40)}\n`;

function saveLicense(dependencies) {
  dependencies.sort(
    (dependencyA, dependencyB) =>
      dependencyA.name.localeCompare(dependencyB.name) ||
      dependencyA.version.localeCompare(dependencyB.version)
  );

  const prettierLicense = fs.readFileSync(file, "utf8").trim();

  const licenses = [
    ...new Set(
      dependencies
        .filter(({ license }) => license)
        .map(({ license }) => license)
    ),
  ];
  const text = outdent`
    # Prettier license

    Prettier is released under the MIT license:

    ${prettierLicense}

    # Licenses of bundled dependencies

    The published Prettier artifact additionally contains code with the following licenses:
    ${licenses.join(", ")}

    # Bundled dependencies
  `;

  const content = dependencies
    .map((dependency) => {
      let text = `## ${dependency.name}@v${dependency.version}\n`;

      const meta = [];

      if (dependency.license) {
        meta.push(`License: ${dependency.license}`);
      }
      if (dependency.author && dependency.author.name) {
        meta.push(`By: ${dependency.author.name}`);
      }
      if (dependency.repository && dependency.repository.url) {
        meta.push(`Repository: ${dependency.repository.url}`);
      }

      if (meta.length > 0) {
        text += "\n" + meta.join("\n") + "\n";
      }

      if (dependency.licenseText) {
        text +=
          "\n" +
          dependency.licenseText
            .trim()
            .split("\n")
            .map((line) => (line ? `> ${line}` : ">"))
            .join("\n") +
          "\n";
      }
      return text;
    })
    .join(separator);

  fs.writeFileSync(file, text + "\n\n" + content + "\n");
}

module.exports = saveLicense;
