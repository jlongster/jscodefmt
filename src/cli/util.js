"use strict";

const chalk = require("chalk");

const CATEGORY_OTHER = "Other";

function indent(str, spaces) {
  return str.replace(/^/gm, " ".repeat(spaces));
}

function groupBy(array, getKey) {
  return array.reduce((obj, item) => {
    const key = getKey(item);
    const previousItems = key in obj ? obj[key] : [];
    return Object.assign({}, obj, { [key]: previousItems.concat(item) });
  }, Object.create(null));
}

function createLogger(logLevel) {
  return {
    warn: createLogFunc("warn", "yellow"),
    error: createLogFunc("error", "red"),
    debug: createLogFunc("debug", "blue"),
    log: createLogFunc("log")
  };

  function createLogFunc(loggerName, color) {
    if (!shouldLog(loggerName)) {
      return () => {};
    }

    const prefix = color ? `[${chalk[color](loggerName)}] ` : "";
    return function(message, opts) {
      opts = Object.assign({ newline: true }, opts);
      const stream = process[loggerName === "log" ? "stdout" : "stderr"];
      stream.write(message.replace(/^/gm, prefix) + (opts.newline ? "\n" : ""));
    };
  }

  function shouldLog(loggerName) {
    switch (logLevel) {
      case "silent":
        return false;
      default:
        return true;
      case "debug":
        if (loggerName === "debug") {
          return true;
        }
      // fall through
      case "log":
        if (loggerName === "log") {
          return true;
        }
      // fall through
      case "warn":
        if (loggerName === "warn") {
          return true;
        }
      // fall through
      case "error":
        return loggerName === "error";
    }
  }
}

function normalizeDetailedOptions(rawDetailedOptions) {
  const names = Object.keys(rawDetailedOptions).sort();

  const normalized = names.map(name => {
    const option = rawDetailedOptions[name];
    return Object.assign({ category: CATEGORY_OTHER }, option, {
      name,
      choices:
        option.choices &&
        option.choices.map(choice => {
          const newChoice = Object.assign(
            { description: "", deprecated: false },
            typeof choice === "object" ? choice : { value: choice }
          );
          if (newChoice.value === true) {
            newChoice.value = ""; // backward compability for original boolean option
          }
          return newChoice;
        })
    });
  });

  return normalized;
}

module.exports = {
  indent,
  groupBy,
  createLogger,
  normalizeDetailedOptions
};
