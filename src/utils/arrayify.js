"use strict";

module.exports = (object, keyName) =>
  Object.entries(object).map(([key, value]) => ({
    [keyName]: key,
    ...value,
  }));
