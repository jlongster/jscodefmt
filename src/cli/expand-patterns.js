"use strict";

const path = require("path");
const fs = require("fs");
const fastGlob = require("fast-glob");
const flat = require("lodash/flatten");

/** @typedef {import('./context').Context} Context */

/**
 * @param {Context} context
 */
function* expandPatterns(context) {
  const cwd = process.cwd();
  const seen = new Set();
  let noResults = true;

  for (const pathOrError of expandPatternsInternal(context)) {
    noResults = false;
    if (typeof pathOrError !== "string") {
      yield pathOrError;
      continue;
    }

    const relativePath = path.relative(cwd, pathOrError);

    // filter out duplicates
    if (seen.has(relativePath)) {
      continue;
    }

    seen.add(relativePath);
    yield relativePath;
  }

  if (noResults && context.argv["error-on-unmatched-pattern"] !== false) {
    // If there was no files and no other errors, let's yield a general error.
    yield {
      error: `No matching files. Patterns: ${context.filePatterns.join(" ")}`,
    };
  }
}

/**
 * @param {Context} context
 */
function* expandPatternsInternal(context) {
  // Ignores files in version control systems directories and `node_modules`
  const silentlyIgnoredDirs = [".git", ".svn", ".hg"];
  if (context.argv["with-node-modules"] !== true) {
    silentlyIgnoredDirs.push("node_modules");
  }
  const globOptions = {
    dot: true,
    ignore: silentlyIgnoredDirs.map((dir) => "**/" + dir),
  };

  let supportedFilesGlob;
  const cwd = process.cwd();

  /** @type {Array<{ type: 'file' | 'dir' | 'glob'; glob: string; input: string; }>} */
  const entries = [];

  for (const pattern of context.filePatterns) {
    const absolutePath = path.resolve(cwd, pattern);

    if (containsIgnoredPathSegment(absolutePath, cwd, silentlyIgnoredDirs)) {
      continue;
    }

    const stat = statSafeSync(absolutePath);
    if (stat) {
      if (stat.isFile()) {
        entries.push({
          type: "file",
          glob: escapePathForGlob(fixWindowsSlashes(pattern)),
          input: pattern,
        });
      } else if (stat.isDirectory()) {
        entries.push({
          type: "dir",
          glob:
            escapePathForGlob(fixWindowsSlashes(pattern)) +
            "/" +
            getSupportedFilesGlob(),
          input: pattern,
        });
      }
    } else if (pattern[0] === "!") {
      // convert negative patterns to `ignore` entries
      globOptions.ignore.push(fixWindowsSlashes(pattern.slice(1)));
    } else {
      entries.push({
        type: "glob",
        glob: fixWindowsSlashes(pattern),
        input: pattern,
      });
    }
  }

  for (const { type, glob, input } of entries) {
    let result;

    try {
      result = fastGlob.sync(glob, globOptions);
    } catch ({ message }) {
      /* istanbul ignore next */
      yield { error: `${errorMessages.globError[type]}: ${input}\n${message}` };
      /* istanbul ignore next */
      continue;
    }

    if (result.length === 0) {
      if (context.argv["error-on-unmatched-pattern"] !== false) {
        yield { error: `${errorMessages.emptyResults[type]}: "${input}".` };
      }
    } else {
      yield* sortPaths(result);
    }
  }

  function getSupportedFilesGlob() {
    if (!supportedFilesGlob) {
      const extensions = flat(
        context.languages.map((lang) => lang.extensions || [])
      );
      const filenames = flat(
        context.languages.map((lang) => lang.filenames || [])
      );
      supportedFilesGlob = `**/{${[
        ...extensions.map((ext) => "*" + (ext[0] === "." ? ext : "." + ext)),
        ...filenames,
      ]}}`;
    }
    return supportedFilesGlob;
  }
}

const errorMessages = {
  globError: {
    file: "Unable to resolve file",
    dir: "Unable to expand directory",
    glob: "Unable to expand glob pattern",
  },
  emptyResults: {
    file: "Explicitly specified file was ignored due to negative glob patterns",
    dir: "No supported files were found in the directory",
    glob: "No files matching the pattern were found",
  },
};

/**
 * @param {string} absolutePath
 * @param {string} cwd
 * @param {string[]} ignoredDirectories
 */
function containsIgnoredPathSegment(absolutePath, cwd, ignoredDirectories) {
  return path
    .relative(cwd, absolutePath)
    .split(path.sep)
    .some((dir) => ignoredDirectories.includes(dir));
}

/**
 * @param {string[]} paths
 */
function sortPaths(paths) {
  return paths.sort((a, b) => a.localeCompare(b));
}

/**
 * Get stats of a given path.
 * @param {string} filePath The path to target file.
 * @returns {fs.Stats | undefined} The stats.
 */
function statSafeSync(filePath) {
  try {
    return fs.statSync(filePath);
  } catch (error) {
    /* istanbul ignore next */
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

/**
 * This function should be replaced with `fastGlob.escapePath` when these issues are fixed:
 * - https://github.com/mrmlnc/fast-glob/issues/261
 * - https://github.com/mrmlnc/fast-glob/issues/262
 * @param {string} path
 */
function escapePathForGlob(path) {
  return fastGlob
    .escapePath(
      path.replace(/\\/g, "\0") // Workaround for fast-glob#262 (part 1)
    )
    .replace(/\\!/g, "@(!)") // Workaround for fast-glob#261
    .replace(/\0/g, "@(\\\\)"); // Workaround for fast-glob#262 (part 2)
}

const isWindows = path.sep === "\\";

/**
 * Using backslashes in globs is probably not okay, but not accepting
 * backslashes as path separators on Windows is even more not okay.
 * https://github.com/prettier/prettier/pull/6776#discussion_r380723717
 * https://github.com/mrmlnc/fast-glob#how-to-write-patterns-on-windows
 * @param {string} pattern
 */
function fixWindowsSlashes(pattern) {
  return isWindows ? pattern.replace(/\\/g, "/") : pattern;
}

module.exports = {
  expandPatterns,
  fixWindowsSlashes,
};
