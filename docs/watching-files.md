---
id: watching-files
title: Watching For Changes
---

If you prefer to have prettier watch for changes from the command line you can use a package like [onchange](https://www.npmjs.com/package/onchange). For example:

```bash
npx onchange '**/*.js' -- npx prettier --write {{changed}}
```

or add the following to your `package.json`

```json
{
  "scripts": {
    "prettier-watch": "onchange '**/*.js' -- prettier --write {{changed}}"
  }
}
```
