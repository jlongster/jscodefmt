"use strict";

const name = "uppercase-rocks";

module.exports = {
  languages: [
    {
      name,
      parsers: [name],
    },
  ],
  parsers: {
    [name]: {
      parse: (text) => ({ value: text }),
      astFormat: name,
    },
  },
  printers: {
    [name]: {
      print: (path) =>
        path.getValue().value.toUpperCase() +
        // Just for test
        // See https://github.com/prettier/prettier/pull/8465#issuecomment-645273859
        "\n\r\n",
    },
  },
};
