// @flow
// Example found at
// https://github.com/sebmarkbage/art/blob/51ffce8164a555d652843241c2fdda52e186cbbd/parsers/svg/text.js#L137
const evil_regex_as_a_string = "/[\s�]*$/";

const error: string = 123; // Should be an error, but can't lex this file
