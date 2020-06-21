---
id: version-stable-install
title: Install
original_id: install
---

Install with `yarn`:

```bash
yarn add prettier --dev --exact
# or globally
yarn global add prettier
```

_We're using `yarn` but you can use `npm` if you like:_

```bash
npm install --save-dev --save-exact prettier
# or globally
npm install --global prettier
```

> We recommend pinning an exact version of prettier in your `package.json` as we introduce stylistic changes in patch releases.

If you use `npx` to run Prettier, the version should be pinned like this:

```bash
npx prettier@2.0.5 . --write
```
