"use strict";

const htmlStyles = require("html-styles");
const fromPairs = require("lodash/fromPairs");
const flat = require("lodash/flatten");

const getCssStyleTags = (property) =>
  fromPairs(
    flat(
      htmlStyles
        .filter((htmlStyle) => htmlStyle.style[property])
        .map((htmlStyle) =>
          htmlStyle.selectorText
            .split(",")
            .map((selector) => selector.trim())
            .filter((selector) => /^[\dA-Za-z]+$/.test(selector))
            .map((tagName) => [tagName, htmlStyle.style[property]])
        )
    )
  );

const CSS_DISPLAY_TAGS = {
  ...getCssStyleTags("display"),

  // TODO: send PR to upstream

  button: "inline-block",

  // special cases for some css display=none elements
  template: "inline",
  source: "block",
  track: "block",
  script: "block",

  // there's no css display for these elements but they behave these ways
  video: "inline-block",
  audio: "inline-block",
  select: "inline-block",
  optgroup: "inline-block",
};
const CSS_DISPLAY_DEFAULT = "inline";
const CSS_WHITE_SPACE_TAGS = getCssStyleTags("white-space");
const CSS_WHITE_SPACE_DEFAULT = "normal";

module.exports = {
  CSS_DISPLAY_TAGS,
  CSS_DISPLAY_DEFAULT,
  CSS_WHITE_SPACE_TAGS,
  CSS_WHITE_SPACE_DEFAULT,
};
