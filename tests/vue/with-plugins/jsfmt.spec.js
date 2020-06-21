const plugins = [
  require.resolve(
    "../../../tests_config/prettier-plugins/prettier-plugin-uppercase-rocks/"
  ),
];

run_spec(__dirname, ["vue"], { plugins });
run_spec(__dirname, ["vue"], { plugins, embeddedLanguageFormatting: "off" });
