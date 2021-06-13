import path from "node:path";
import { rollup } from "rollup";
import { nodeResolve as rollupPluginNodeResolve } from "@rollup/plugin-node-resolve";
import rollupPluginAlias from "@rollup/plugin-alias";
import rollupPluginCommonjs from "@rollup/plugin-commonjs";
import rollupPluginPolyfillNode from "rollup-plugin-polyfill-node";
import rollupPluginJson from "@rollup/plugin-json";
import rollupPluginReplace from "@rollup/plugin-replace";
import { terser as rollupPluginTerser } from "rollup-plugin-terser";
import { babel as rollupPluginBabel } from "@rollup/plugin-babel";
import createEsmUtils from "esm-utils";
import builtinModules from "builtin-modules";
import rollupPluginExecutable from "./rollup-plugins/executable.mjs";
import rollupPluginEvaluate from "./rollup-plugins/evaluate.mjs";
import rollupPluginReplaceModule from "./rollup-plugins/replace-module.mjs";
import bundles from "./config.mjs";

const { __dirname, require } = createEsmUtils(import.meta);
const PROJECT_ROOT = path.join(__dirname, "../..");

const entries = [
  // Force using the CJS file, instead of ESM; i.e. get the file
  // from `"main"` instead of `"module"` (rollup default) of package.json
  {
    find: "outdent",
    replacement: require.resolve("outdent"),
  },
  {
    find: "lines-and-columns",
    replacement: require.resolve("lines-and-columns"),
  },
  {
    find: "@angular/compiler/src",
    replacement: path.resolve(
      `${PROJECT_ROOT}/node_modules/@angular/compiler/esm2015/src`
    ),
  },
  // Avoid rollup `SOURCEMAP_ERROR` and `THIS_IS_UNDEFINED` error
  {
    find: "@glimmer/syntax",
    replacement: require.resolve("@glimmer/syntax"),
  },
  // https://github.com/rollup/plugins/issues/670
  {
    find: "is-core-module",
    replacement: require.resolve("is-core-module"),
  },
  {
    find: "yaml/util",
    replacement: require.resolve("yaml/util"),
  },
  // `postcss-less`
  {
    find: "postcss/lib/input",
    replacement: require.resolve("postcss/lib/input"),
  },
  {
    find: "postcss/lib/parser",
    replacement: require.resolve("postcss/lib/parser"),
  },
  {
    find: "postcss/lib/comment",
    replacement: require.resolve("postcss/lib/comment"),
  },
  {
    find: "postcss/lib/stringifier",
    replacement: require.resolve("postcss/lib/stringifier"),
  },
  {
    find: "postcss/lib/tokenize",
    replacement: require.resolve("postcss/lib/tokenize"),
  },
];

function getBabelConfig(bundle) {
  const config = {
    babelrc: false,
    assumptions: {
      setSpreadProperties: true,
    },
    sourceType: "unambiguous",
    plugins: bundle.babelPlugins || [],
    compact: bundle.type === "plugin" ? false : "auto",
    exclude: [/\/core-js\//],
  };
  const targets = { node: "10" };
  if (bundle.target === "universal") {
    targets.browsers = [
      ">0.5%",
      "not ie 11",
      "not safari 5.1",
      "not op_mini all",
    ];
  }
  config.presets = [
    [
      "@babel/preset-env",
      {
        targets,
        exclude: [
          "es.array.unscopables.flat-map",
          "es.promise",
          "es.promise.finally",
          "es.string.replace",
          "es.symbol.description",
          "es.typed-array.*",
          "web.*",
        ],
        modules: false,
        useBuiltIns: "usage",
        corejs: {
          version: 3,
        },
        debug: false,
      },
    ],
  ];
  config.plugins.push([
    "@babel/plugin-proposal-object-rest-spread",
    { useBuiltIns: true },
  ]);
  return config;
}

function getRollupConfig(bundle) {
  const config = {
    input: bundle.input,
    onwarn(warning) {
      if (
        // ignore `MIXED_EXPORTS` warn
        warning.code === "MIXED_EXPORTS" ||
        (warning.code === "CIRCULAR_DEPENDENCY" &&
          (warning.importer.startsWith("node_modules") ||
            warning.importer.startsWith("\x00polyfill-node:"))) ||
        warning.code === "SOURCEMAP_ERROR" ||
        warning.code === "THIS_IS_UNDEFINED"
      ) {
        return;
      }

      // web bundle can't have external requires
      if (
        warning.code === "UNRESOLVED_IMPORT" &&
        bundle.target === "universal"
      ) {
        throw new Error(
          `Unresolved dependency in universal bundle: ${warning.source}`
        );
      }

      console.warn(warning);
    },
    external: [],
  };

  const replaceStrings = {
    "process.env.PRETTIER_TARGET": JSON.stringify(bundle.target),
    "process.env.NODE_ENV": JSON.stringify("production"),
  };
  if (bundle.target === "universal") {
    // We can't reference `process` in UMD bundles and this is
    // an undocumented "feature"
    replaceStrings["process.env.PRETTIER_DEBUG"] = "global.PRETTIER_DEBUG";
    // `rollup-plugin-node-globals` replace `__dirname` with the real dirname
    // `parser-typescript.js` will contain a path of working directory
    // See #8268
    replaceStrings.__filename = JSON.stringify(
      "/prettier-security-filename-placeholder.js"
    );
    replaceStrings.__dirname = JSON.stringify(
      "/prettier-security-dirname-placeholder"
    );
  }
  Object.assign(replaceStrings, bundle.replace);

  const babelConfig = { babelHelpers: "bundled", ...getBabelConfig(bundle) };

  const alias = { ...bundle.alias };
  alias.entries = [...entries, ...(alias.entries || [])];

  const replaceModule = {};
  // Replace other bundled files
  if (bundle.target === "node") {
    for (const item of bundles) {
      if (item.input !== bundle.input) {
        replaceModule[path.join(PROJECT_ROOT, item.input)] = `./${item.output}`;
      }
    }
    replaceModule[path.join(PROJECT_ROOT, "./package.json")] = "./package.json";
  }
  Object.assign(replaceModule, bundle.replaceModule);

  config.plugins = [
    rollupPluginReplace({
      values: replaceStrings,
      delimiters: ["", ""],
      preventAssignment: true,
    }),
    rollupPluginExecutable(),
    rollupPluginEvaluate(),
    rollupPluginJson({
      exclude: Object.keys(replaceModule)
        .filter((file) => file.endsWith(".json"))
        .map((file) => path.relative(PROJECT_ROOT, file)),
    }),
    rollupPluginAlias(alias),
    rollupPluginNodeResolve({
      extensions: [".js", ".json"],
      preferBuiltins: bundle.target === "node",
    }),
    rollupPluginCommonjs({
      ignoreGlobal: bundle.target === "node",
      ignore:
        bundle.type === "plugin"
          ? undefined
          : (id) => /\.\/parser-.*?/.test(id),
      requireReturnsDefault: "preferred",
      ignoreDynamicRequires: true,
      ignoreTryCatch: bundle.target === "node",
      ...bundle.commonjs,
    }),
    replaceModule && rollupPluginReplaceModule(replaceModule),
    bundle.target === "universal" && rollupPluginPolyfillNode(),
    rollupPluginBabel(babelConfig),
  ].filter(Boolean);

  if (bundle.target === "node") {
    config.external.push(...builtinModules);
  }
  if (bundle.external) {
    config.external.push(...bundle.external);
  }

  return config;
}

function getRollupOutputOptions(bundle, buildOptions) {
  const options = {
    // Avoid warning form #8797
    exports: "auto",
    file: `dist/${bundle.output}`,
    name: bundle.name,
    plugins: [
      bundle.minify !== false &&
        bundle.target === "universal" &&
        rollupPluginTerser({
          output: {
            ascii_only: true,
          },
        }),
    ],
  };

  if (bundle.target === "node") {
    options.format = "cjs";
  } else if (bundle.target === "universal") {
    if (!bundle.format) {
      return [
        {
          ...options,
          format: "umd",
        },
        !buildOptions.playground && {
          ...options,
          format: "esm",
          file: `dist/esm/${bundle.output.replace(".js", ".mjs")}`,
        },
      ].filter(Boolean);
    }
    options.format = bundle.format;
  }

  if (buildOptions.playground) {
    return { skipped: true };
  }
  return [options];
}

async function createBundle(bundle, cache, options) {
  const inputOptions = getRollupConfig(bundle);
  const outputOptions = getRollupOutputOptions(bundle, options);

  if (!Array.isArray(outputOptions) && outputOptions.skipped) {
    return { skipped: true };
  }

  if (
    !options["purge-cache"] &&
    (
      await Promise.all(
        outputOptions.map((outputOption) =>
          cache.isCached(inputOptions, outputOption)
        )
      )
    ).every((cached) => cached)
  ) {
    return { cached: true };
  }

  const result = await rollup(inputOptions);
  await Promise.all(outputOptions.map((option) => result.write(option)));

  return { bundled: true };
}

export default createBundle;
