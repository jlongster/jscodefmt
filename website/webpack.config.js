"use strict";

module.exports = {
  entry: {
    playground: "./playground/index.js",
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/static/",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/env", "@babel/react"],
        },
      },
    ],
  },
  externals: {
    clipboard: "ClipboardJS",
    codemirror: "CodeMirror",
    react: "React",
    "react-dom": "ReactDOM",
  },
};
