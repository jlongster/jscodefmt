"use strict";

// eslint-disable-next-line no-restricted-modules
require("please-upgrade-node")(require("../../package.json"));

const stringify = require("fast-json-stable-stringify");
// eslint-disable-next-line no-restricted-modules
const prettier = require("../index");
const util = require("./util");

async function run(args) {
  const context = util.createContext(args);

  try {
    util.initContext(context);

    context.logger.debug(`normalized argv: ${JSON.stringify(context.argv)}`);

    if (context.argv.check && context.argv["list-different"]) {
      context.logger.error("Cannot use --check and --list-different together.");
      process.exit(1);
    }

    if (context.argv.write && context.argv["debug-check"]) {
      context.logger.error("Cannot use --write and --debug-check together.");
      process.exit(1);
    }

    if (context.argv["find-config-path"] && context.filePatterns.length) {
      context.logger.error("Cannot use --find-config-path with multiple files");
      process.exit(1);
    }

    if (context.argv["file-info"] && context.filePatterns.length) {
      context.logger.error("Cannot use --file-info with multiple files");
      process.exit(1);
    }

    if (context.argv.version) {
      context.logger.log(prettier.version);
      process.exit(0);
    }

    if (context.argv.help !== undefined) {
      context.logger.log(
        typeof context.argv.help === "string" && context.argv.help !== ""
          ? util.createDetailedUsage(context, context.argv.help)
          : util.createUsage(context)
      );
      process.exit(0);
    }

    if (context.argv["support-info"]) {
      context.logger.log(
        prettier.format(stringify(prettier.getSupportInfo()), {
          parser: "json",
        })
      );
      process.exit(0);
    }

    const hasFilePatterns = context.filePatterns.length !== 0;
    const useStdin =
      !hasFilePatterns &&
      (!process.stdin.isTTY || context.args["stdin-filepath"]);

    if (context.argv["find-config-path"]) {
      util.logResolvedConfigPathOrDie(context);
    } else if (context.argv["file-info"]) {
      util.logFileInfoOrDie(context);
    } else if (useStdin) {
      util.formatStdin(context);
    } else if (hasFilePatterns) {
      await util.formatFiles(context);
    } else {
      context.logger.log(util.createUsage(context));
      process.exit(1);
    }
  } catch (error) {
    context.logger.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  run,
};
