# Release script

## Usage

```sh
node ./scripts/release/release.js --version NEW_VERSION
```

The script has its own `package.json` so we can reinstall the root's `node_modules/` while making the release.

## Credits

This script was inspired by [React's release script](https://github.com/facebook/react/tree/001f9ef/scripts/release).
