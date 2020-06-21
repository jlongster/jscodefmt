const parsers = require("prettier/local")
  .getSupportInfo()
  .options.find((option) => option.name === "parser")
  .choices.filter((choice) => !choice.deprecated)
  .map((choice) => choice.value);

run_spec(
  {
    dirname: __dirname,
    snippets: [
      // empty
      "",
      // space
      " ",
      "     ",
      // `\n`
      "\n",
      " \n",
      " \n ",
      "\n\n\n\n",
      " \n  \n \n\n",
      " \n  \n \n\n ",
      // `\r`
      "\r",
      " \r",
      " \r ",
      "\r\r\r\r",
      " \r  \r \r\r",
      " \r  \r \r\r ",
      // `\r\n`
      "\r\n",
      " \r\n",
      " \r\n ",
      "\r\n\r\n\r\n\r\n",
      " \r\n  \r\n \r\n\r\n",
      " \r\n  \r\n \r\n\r\n ",
      // mixed `\r` `\r\n` '\n'
      " \r \r\n \n ",
    ].map((code) => ({ code, output: "" })),
  },
  parsers
);
