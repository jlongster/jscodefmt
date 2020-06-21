"use strict";

// `/scripts/build/babel-plugins/transform-custom-require.js` doesn't support destructuring.
// eslint-disable-next-line prefer-destructuring
let resolve = eval("require").resolve;

// In the VS Code and Atom extensions `require` is overridden and `require.resolve` doesn't support the 2nd argument.
if (resolve.length === 1 || process.env.PRETTIER_FALLBACK_RESOLVE) {
  resolve = (id, options) => {
    let basedir;
    if (options && options.paths && options.paths.length === 1) {
      basedir = options.paths[0];
    }

    return require("resolve").sync(id, { basedir });
  };
}

module.exports = resolve;
