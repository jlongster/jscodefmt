"use strict";

module.exports = function (linguistData, override) {
  const { languageId, ...rest } = linguistData;
  return {
    linguistLanguageId: languageId,
    ...rest,
    ...override(linguistData),
  };
};
