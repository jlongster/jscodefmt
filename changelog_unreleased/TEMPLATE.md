<!--

1. Choose a folder based on which language your PR is for.

   - For JavaScript, choose `javascript/` etc.
   - For TypeScript specific syntax, choose `typescript/`.
   - If your PR applies to multiple languages, such as TypeScript/Flow, choose one folder and mention which languages it applies to.

2. In your chosen folder, create a file with your PR number: `pr-XXXX.md`. For example: `typescript/pr-6728.md`.

3. Copy the content below and paste it in your new file.

4. Fill in a title, the PR number and your user name.

5. Optionally write a description. Many times it’s enough with just sample code.

6. Change ```jsx to your language. For example, ```yaml.

7. Choose some nice input example code. Paste it along with the output before and after your PR.

-->

#### Title ([#XXXX](https://github.com/prettier/prettier/pull/XXXX) by [@user](https://github.com/user))

Optional description if it makes sense.

Input:

<!-- prettier-ignore -->
```jsx
(foo ?? baz) || baz;
```

Prettier stable:

<!-- prettier-ignore -->
```jsx
foo ?? baz || baz;
```

Prettier master:

<!-- prettier-ignore -->
```jsx
(foo ?? baz) || baz;
```
