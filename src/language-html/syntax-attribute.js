"use strict";

const parseSrcset = require("@fisker/parse-srcset");
const {
  builders: { concat, ifBreak, join, line },
} = require("../document");

function printImgSrcset(value) {
  const srcset = parseSrcset(value, {
    logger: {
      error(message) {
        throw new Error(message);
      },
    },
  });

  const hasW = srcset.some(({ w }) => w);
  const hasH = srcset.some(({ h }) => h);
  const hasX = srcset.some(({ d }) => d);

  if (hasW + hasH + hasX > 1) {
    throw new Error("Mixed descriptor in srcset is not supported");
  }

  const key = hasW ? "w" : hasH ? "h" : "d";
  const unit = hasW ? "w" : hasH ? "h" : "x";

  const getMax = (values) => Math.max(...values);

  const urls = srcset.map((src) => src.url);
  const maxUrlLength = getMax(urls.map((url) => url.length));

  const descriptors = srcset
    .map((src) => src[key])
    .map((descriptor) => (descriptor ? descriptor.toString() : ""));
  const descriptorLeftLengths = descriptors.map((descriptor) => {
    const index = descriptor.indexOf(".");
    return index === -1 ? descriptor.length : index;
  });
  const maxDescriptorLeftLength = getMax(descriptorLeftLengths);

  return join(
    concat([",", line]),
    urls.map((url, index) => {
      const parts = [url];

      const descriptor = descriptors[index];
      if (descriptor) {
        const urlPadding = maxUrlLength - url.length + 1;
        const descriptorPadding =
          maxDescriptorLeftLength - descriptorLeftLengths[index];

        const alignment = " ".repeat(urlPadding + descriptorPadding);
        parts.push(ifBreak(alignment, " "), descriptor + unit);
      }

      return concat(parts);
    })
  );
}

function printClassNames(value) {
  return value.trim().split(/\s+/).join(" ");
}

module.exports = {
  printImgSrcset,
  printClassNames,
};
