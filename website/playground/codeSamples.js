export default function (parser) {
  switch (parser) {
    case "babel":
      return [
        'function HelloWorld({greeting = "hello", greeted = \'"World"\', silent = false, onMouseOver,}) {',
        "",
        "  if(!greeting){return null};",
        "",
        "     // TODO: Don't use random in render",
        '  let num = Math.floor (Math.random() * 1E+7).toString().replace(/\\.\\d+/ig, "")',
        "",
        "  return <div className='HelloWorld' title={`You are visitor number ${ num }`} onMouseOver={onMouseOver}>",
        "",
        "    <strong>{ greeting.slice( 0, 1 ).toUpperCase() + greeting.slice(1).toLowerCase() }</strong>",
        '    {greeting.endsWith(",") ? " " : <span style={{color: \'\\grey\'}}>", "</span> }',
        "    <em>",
        "\t{ greeted }",
        "\t</em>",
        "    { (silent)",
        '      ? "."',
        '      : "!"}',
        "",
        "    </div>;",
        "",
        "}",
      ].join("\n");
    case "flow":
    case "babel-flow":
      return [
        "declare export function graphql<Props, Variables, Component: React$ComponentType<Props>>",
        "  (query: GQLDocument, config?: Config<Props, QueryConfigOptions<Variables>>):",
        "  (Component: Component) => React$ComponentType<$Diff<React$ElementConfig<Component>, {",
        "    data: Object|void,",
        "    mutate: Function|void",
        "  }>>",
        "",
        'declare type FetchPolicy = "cache-first" | "cache-and-network" | "network-only" | "cache-only"',
      ].join("\n");
    case "typescript":
    case "babel-ts":
      return [
        "interface MyInterface {",
        "  foo(): string,",
        "  bar: Array<number>,",
        "}",
        "",
        "export abstract class Foo implements MyInterface {",
        "  foo() {",
        "            // TODO: return an actual value here",
        "        return 'hello'",
        "      }",
        "  get bar() {",
        "    return [  1,",
        "",
        "      2, 3,",
        "    ]",
        "  }",
        "}",
        "",
        "type RequestType = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'OPTIONS' | 'CONNECT' | 'DELETE' | 'TRACE'",
      ].join("\n");
    case "css":
      // Excerpted from the Bootstrap source, which is licensed under the MIT license:
      // https://github.com/twbs/bootstrap/blob/v4.0.0-beta.3/LICENSE
      return [
        "@media (max-width: 480px) {",
        "  .bd-examples {margin-right: -.75rem;margin-left: -.75rem",
        "  }",
        "  ",
        ' .bd-examples>[class^="col-"]  {',
        "    padding-right: .75rem;",
        "    padding-left: .75rem;",
        "  ",
        "  }",
        "}",
      ].join("\n");
    case "scss":
      // Excerpted from the Bootstrap source, which is licensed under the MIT license:
      // https://github.com/twbs/bootstrap/blob/v4.0.0-beta.3/LICENSE
      return [
        "@function color-yiq($color) {",
        "  $r: red($color);$g: green($color);$b: blue($color);",
        "",
        "  $yiq: (($r * 299) + ($g * 587) + ($b * 114)) / 1000;",
        "",
        "  @if ($yiq >= $yiq-contrasted-threshold) {",
        "    @return $yiq-text-dark;",
        "} @else {",
        "    @return $yiq-text-light;",
        "  }",
        "}",
        "",
        "@each $color, $value in $colors {",
        "  .swatch-#{$color} {",
        "    color: color-yiq($value);",
        "    background-color: #{$value};",
        "  }",
        "}",
      ].join("\n");
    case "less":
      // Copied from http://lesscss.org/features/#detached-rulesets-feature
      return [
        "@my-ruleset: {",
        "    .my-selector {",
        "      @media tv {",
        "        background-color: black;",
        "      }",
        "    }",
        "  };",
        "@media (orientation:portrait) {",
        "    @my-ruleset();",
        "}",
      ].join("\n");
    case "json":
    case "json5":
    case "json-stringify":
      // Excerpted & adapted from Wikipedia, under the Creative Commons Attribution-ShareAlike License
      // https://en.wikipedia.org/wiki/JSON#Example
      return [
        '{"allOn": "Single", "Line": "example",',
        '"noSpace":true,',
        '  "quote": {',
        "    'singleQuote': 'example',",
        '                  "indented": true,',
        "  },",
        '  "phoneNumbers": [',
        '    {"type": "home",',
        '      "number": "212 555-1234"},',
        '    {"type": "office",',
        '      "trailing": "commas by accident"},',
        "  ],",
        "}",
      ].join("\n");
    case "graphql":
      return [
        "query Browse($offset: Int, $limit: Int, $categories: [String!], $search: String) {",
        "  browse(limit: $limit, offset: $offset, categories: $categories, search: $search) {",
        "    total,",
        "    results {",
        "        title",
        "        price",
        "    }",
        "  }",
        "}",
      ].join("\n");
    case "markdown":
      return [
        "Header",
        "======",
        "",
        "_Look,_ code blocks are formatted *too!*",
        "",
        "``` js",
        "function identity(x) { return x }",
        "```",
        "",
        "Pilot|Airport|Hours",
        "--|:--:|--:",
        "John Doe|SKG|1338",
        "Jane Roe|JFK|314",
        "",
        "- - - - - - - - - - - - - - -",
        "",
        "+ List",
        " + with a [link] (/to/somewhere)",
        "+ and [another one]",
        "",
        "",
        "  [another one]:  http://example.com 'Example title'",
        "",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Curabitur consectetur maximus risus, sed maximus tellus tincidunt et.",
      ].join("\n");
    case "mdx":
      // modified from https://github.com/mdx-js/mdx/blob/master/packages/mdx/test/fixtures/blog-post.md
      return [
        "import     {     Baz } from     './Fixture'",
        "import { Buz  }   from './Fixture'",
        "",
        "export  const   foo    = {",
        "  hi:     `Fudge ${Baz.displayName || 'Baz'}`,",
        "  authors: [",
        "     'fred',",
        "           'sally'",
        "    ]",
        "}",
        "",
        "# Hello,    world!",
        "",
        "",
        " I'm an awesome   paragraph.",
        "",
        "<!-- I'm a comment -->",
        "",
        "<Foo bg='red'>",
        "      <Bar    >hi    </Bar>",
        "       {  hello       }",
        "       {     /* another comment */}",
        "</Foo>",
        "",
        "```",
        "test codeblock",
        "```",
        "",
        "```js",
        "module.exports = 'test'",
        "```",
        "",
        "```sh",
        "npm i -g foo",
        "```",
        "",
        "| Test  | Table   |",
        "|    :---     | :----  |",
        "|   Col1  | Col2    |",
        "",
        "export   default     ({children   }) => < div>{    children}</div>",
        "",
      ].join("\n");
    case "vue":
      return [
        "<template>",
        "  <p>Templates are formatted as well...",
        "    </p>",
        "</template>",
        "",
        "<script>",
        "let Prettier = format => { your.js('though') }",
        "</script>",
        "",
        "<style>",
        ".and { css: too !important }",
        "</style>",
      ].join("\n");
    case "yaml":
      // modified from http://yaml.org/start.html
      return [
        "---",
        "invoice   :   34843",
        "date   :    2001-01-23",
        "bill-to:    &id001",
        "    given    : Chris",
        "    family  : Dumars",
        "    address:",
        "        lines: |",
        "            458 Walkman Dr.",
        "            Suite #292",
        "        city        : Royal Oak",
        "        state      : MI",
        "        postal  : 48046",
        "ship-to: *id001",
        "product:",
        "    - ",
        "    ",
        "      sku         : BL394D",
        "      ? quantity    ",
        "      : 4",
        "      description : Basketball",
        "      ? price       ",
        "      : 450.00",
        "      ",
        "      ",
        "    - ",
        "      sku          :   BL4438H",
        "      quantity      :  1",
        "      description:      Super Hoop",
        "      price         :  2392.00",
        "      ",
        "      ",
        "tax  :  251.42",
        "total : 4443.52",
        "comments: >",
        "    Late afternoon is best.",
        "    Backup contact is Nancy",
        "    Billsmer @ 338-4338.",
        "",
      ].join("\n");
    case "glimmer":
      // modified from http://handlebarsjs.com/
      return [
        '  <div     class="entry"    >',
        "  <h1>{{  title    }}</h1>",
        '  <div   class="body">',
        "            {{   body         }}",
        "</div> </div>",
      ].join("\n");
    case "html":
    case "angular":
    case "lwc":
      return [
        "<!DOCTYPE html>",
        '<HTML CLASS="no-js mY-ClAsS">',
        "  <HEAD>",
        '    <META CHARSET="utf-8">',
        "    <TITLE>My tITlE</TITLE>",
        '    <META NAME="description" content="My CoNtEnT">',
        "  </HEAD>",
        "  <body>",
        "    <P>Hello world!<BR> This is HTML5 Boilerplate.</P>",
        "    <SCRIPT>",
        "      window.ga = function () { ga.q.push(arguments) }; ga.q = []; ga.l = +new Date;",
        "      ga('create', 'UA-XXXXX-Y', 'auto'); ga('send', 'pageview')",
        "    </SCRIPT>",
        '    <SCRIPT src="https://www.google-analytics.com/analytics.js" ASYNC DEFER></SCRIPT>',
        "  </body>",
        "</HTML>",
      ].join("\n");
    default:
      return "";
  }
}
