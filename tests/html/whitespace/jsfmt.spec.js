const { outdent } = require("outdent");

run_spec(
  {
    dirname: __dirname,
    snippets: [
      ...[
        // https://developer.mozilla.org/en-US/docs/Glossary/Whitespace#In_HTML
        // single
        "\u0009",
        "\u000A",
        "\u000C",
        "\u000D",
        "\u0020",

        // many
        "\u0009\u000A\u000C\u000D\u0020",
      ].map((textContent) => ({
        code: `<div>${textContent}</div>`,
        name: "should be empty",
        output: "<div></div>\n",
      })),

      ...[
        // single
        "\u0009",
        "\u000A",
        "\u000C",
        "\u000D",
        "\u0020",

        // many
        "\u0009\u000A\u000C\u000D\u0020",
      ].map((textContent) => ({
        code: `<span>${textContent}</span>`,
        name: "should keep one space",
        output: "<span> </span>\n",
      })),

      ...[
        // single
        "\u0009",
        "\u000A",
        "\u000C",
        "\u000D",
        "\u0020",
      ].map((textContent) => ({
        code: `<img/>${textContent}<img/>`,
        name: "between",
        output: "<img /> <img />\n",
      })),

      {
        code: "<img/>\u0009\u000A\u000C\u000D\u0020<img/>",
        output: "<img />\n\n<img />\n",
      },

      // non-space
      ...[
        "\u2005",
        " \u2005        ",
        "        \u2005\u2005 ",
        "        \u2005        \u2005 ",
      ].map((textContent) => `<div>${textContent}</div>`),

      ...[
        "\u2005",
        " \u2005        ",
        "        \u2005\u2005 ",
        "        \u2005        \u2005 ",
      ].map((textContent) => `<span>${textContent}</span>`),

      ...[
        "\u2005",
        " \u2005        ",
        "        \u2005\u2005 ",
        "        \u2005        \u2005 ",
      ].map((textContent) => `<img/>${textContent}<img/>`),

      // #7103 minimal reproduction
      "<i /> \u2005 | \u2005 <i />",

      // #7103
      "<p><span>X</span> \u2005 or \u2005 <span>Y</span></p><p>X \u2005 or \u2005 Y</p>",

      // This test maybe not good, `U+2005` there don't make sense,
      // but the node has to be `whitespaceSensitive` and `indentationSensitive`,
      // to make the `whitespace check logic` work.
      {
        name: "`U+2005` should indent like `U+005F` not like `U+0020`",
        code: outdent`
          <!-- U+2005 -->
          <script type="text/unknown" lang="unknown">
             \u2005    // comment
                    // comment
                    // comment
                    // comment
          </script>
          <!-- U+005F -->
          <script type="text/unknown" lang="unknown">
             \u005F    // comment
                    // comment
                    // comment
                    // comment
          </script>
          <!-- U+0020 -->
          <script type="text/unknown" lang="unknown">
             \u0020    // comment
                    // comment
                    // comment
                    // comment
          </script>
        `,
      },

      {
        name: "`U+2005` should format like `U+005F` not like `U+0020`",
        code: outdent`
          <!-- U+2005 -->
          <div>before<span>\u2005</span>afterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafter</div>
          <!-- U+005F -->
          <div>before<span>\u005F</span>afterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafter</div>
          <!-- U+0020 -->
          <div>before<span>\u0020</span>afterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafter</div>
        `,
      },
    ],
  },
  ["html"]
);
