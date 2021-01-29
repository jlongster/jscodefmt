const fs = require("fs");
const path = require("path");
const fixtureDirectory = path.join(__dirname, "../eol");

const snippets = fs
  .readdirSync(fixtureDirectory)
  .filter(
    (fileName) => fileName !== "__snapshots__" && fileName !== "jsfmt.spec.js"
  )
  .map((fileName) => {
    const file = path.join(fixtureDirectory, fileName);
    const code = `\uFEFF${fs.readFileSync(file, "utf8")}`;
    return {
      name: fileName,
      code,
    };
  });

run_spec({ dirname: __dirname, snippets }, ["babel"]);
