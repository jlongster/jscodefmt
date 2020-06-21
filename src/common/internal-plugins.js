"use strict";

// We need to use `eval("require")()` to prevent rollup from hoisting the requires. A babel
// plugin will look for `eval("require")()` and transform to `require()` in the bundle,
// and rewrite the paths to require from the top-level.

// We need to list the parsers and getters so we can load them only when necessary.
module.exports = [
  // JS
  require("../language-js"),
  {
    parsers: {
      // JS - Babel
      get babel() {
        return eval("require")("../language-js/parser-babel").parsers.babel;
      },
      get "babel-flow"() {
        return eval("require")("../language-js/parser-babel").parsers[
          "babel-flow"
        ];
      },
      get "babel-ts"() {
        return eval("require")("../language-js/parser-babel").parsers[
          "babel-ts"
        ];
      },
      get json() {
        return eval("require")("../language-js/parser-babel").parsers.json;
      },
      get json5() {
        return eval("require")("../language-js/parser-babel").parsers.json5;
      },
      get "json-stringify"() {
        return eval("require")("../language-js/parser-babel").parsers[
          "json-stringify"
        ];
      },
      get __js_expression() {
        return eval("require")("../language-js/parser-babel").parsers
          .__js_expression;
      },
      get __vue_expression() {
        return eval("require")("../language-js/parser-babel").parsers
          .__vue_expression;
      },
      get __vue_event_binding() {
        return eval("require")("../language-js/parser-babel").parsers
          .__vue_event_binding;
      },
      // JS - Flow
      get flow() {
        return eval("require")("../language-js/parser-flow").parsers.flow;
      },
      // JS - TypeScript
      get typescript() {
        return eval("require")("../language-js/parser-typescript").parsers
          .typescript;
      },
      // JS - Angular Action
      get __ng_action() {
        return eval("require")("../language-js/parser-angular").parsers
          .__ng_action;
      },
      // JS - Angular Binding
      get __ng_binding() {
        return eval("require")("../language-js/parser-angular").parsers
          .__ng_binding;
      },
      // JS - Angular Interpolation
      get __ng_interpolation() {
        return eval("require")("../language-js/parser-angular").parsers
          .__ng_interpolation;
      },
      // JS - Angular Directive
      get __ng_directive() {
        return eval("require")("../language-js/parser-angular").parsers
          .__ng_directive;
      },
    },
  },

  // CSS
  require("../language-css"),
  {
    parsers: {
      // TODO: switch these to just `postcss` and use `language` instead.
      get css() {
        return eval("require")("../language-css/parser-postcss").parsers.css;
      },
      get less() {
        return eval("require")("../language-css/parser-postcss").parsers.less;
      },
      get scss() {
        return eval("require")("../language-css/parser-postcss").parsers.scss;
      },
    },
  },

  // Handlebars
  require("../language-handlebars"),
  {
    parsers: {
      get glimmer() {
        return eval("require")("../language-handlebars/parser-glimmer").parsers
          .glimmer;
      },
    },
  },

  // GraphQL
  require("../language-graphql"),
  {
    parsers: {
      get graphql() {
        return eval("require")("../language-graphql/parser-graphql").parsers
          .graphql;
      },
    },
  },

  // Markdown
  require("../language-markdown"),
  {
    parsers: {
      get remark() {
        return eval("require")("../language-markdown/parser-markdown").parsers
          .remark;
      },
      get markdown() {
        return eval("require")("../language-markdown/parser-markdown").parsers
          .remark;
      },
      get mdx() {
        return eval("require")("../language-markdown/parser-markdown").parsers
          .mdx;
      },
    },
  },

  require("../language-html"),
  {
    parsers: {
      // HTML
      get html() {
        return eval("require")("../language-html/parser-html").parsers.html;
      },
      // Vue
      get vue() {
        return eval("require")("../language-html/parser-html").parsers.vue;
      },
      // Angular
      get angular() {
        return eval("require")("../language-html/parser-html").parsers.angular;
      },
      // Lightning Web Components
      get lwc() {
        return eval("require")("../language-html/parser-html").parsers.lwc;
      },
    },
  },

  // YAML
  require("../language-yaml"),
  {
    parsers: {
      get yaml() {
        return eval("require")("../language-yaml/parser-yaml").parsers.yaml;
      },
    },
  },
];
