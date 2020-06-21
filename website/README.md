# Prettier Website

https://prettier.io/

## Getting started

1. Build the Prettier browser libs for the Playground by running the following in the project root directory:

   ```sh
   cd your/path/to/prettier
   yarn build-docs
   ```

   To build for the current branch, use `PULL_REQUEST=true yarn build-docs`. Otherwise, a release version of Prettier from `node_modules` is used.

2. Switch to the `website` directory and start the development server:

   ```sh
   cd website
   yarn start
   ```

   This starts a server hosting the website locally at `http://localhost:3000/`. Any changes to the site's source files are reflected after refreshing the page, i.e. the server does not need to be restarted to show changes.

## Docusaurus

The site is built on [Docusaurus](https://docusaurus.io/), a static site generator for documentation sites.

Its main configuration file is `siteConfig.js` ([docs](https://docusaurus.io/docs/en/site-config)).

Pages can be added to the site by putting `.js` files with React components in `pages/`. If you want to use code from other files in these pages, be aware of [how `require` works in Docusaurus](https://docusaurus.io/docs/en/api-pages#page-require-paths). It's also possible to include `.html` files directly. They are served as is and don't have any of the header, footer, or styles shared by the rest of Docusaurus. This is the way the Playground is hooked up (`pages/playground/index.html`).

Images and other static assets are placed inside the `static` directory: `static/img/your-image.png` is mapped to `http://prettier.io/img/your-image.png`. Any `.css` files in `static/` are concatenated to the standard styles provided by Docusaurus and used site-wide.

Please run <code>yarn svgo _path/to/image.svg_</code> before committing a new SVG to the repository.

## Playground

The Playground is not integrated with the Docusaurus infrastructure. Its UI (`website/playground/`) is built separately with webpack configured to put the resulting bundle in Docusaurus's `static` directory. The `yarn start` command (in `website/`) concurrently starts both Docusaurus's local server and webpack in the watch mode for the Playground.

Another part of the Playground is a web worker where formatting happens. It's not managed by webpack and resides directly in `static/worker.js`. It expects to find the [UMD bundles of Prettier](https://prettier.io/docs/en/browser.html) in `static/lib/`. That's why running `yarn build-docs` or `PULL_REQUEST=true yarn build-docs` in the project root is a required step.

Finally, there is a service worker that caches Prettier's relatively heavy bundles (`static/service-worker.js`).

## Documentation

In the project repo, the `docs` directory is used to hold documentation written in Markdown.
The front matter of documentation files should follow this example:

```yaml
id: doc1 # used for docs to find each other and to map links
title: Document Title
layout: docs1 # used to determine different sidebar groupings
category: Sidebar Category 1 # Category on the sidebar under which this doc goes
permalink: docs/en/doc1.html # link to the document that is used for site
previous: doc0 # previous doc on sidebar for navigation
next: doc2 # next doc on the sidebar for navigation
# don't include next if this is the last doc; don't include previous if first doc
---

```

The docs from `docs/` are published to `https://prettier.io/docs/en/next/` and are considered to be the docs of the next (not yet released) version of Prettier. When a release happens, the docs from `docs/` are copied to the `website/versioned_docs/version-stable` directory, whose content is published to `https://prettier.io/docs/en`.

## Blog

The `website/blog` directory contains blog posts written in Markdown. Their front matter should follow this example:

```yaml
title: Blog Post Title
author: Author Name
authorURL: http://github.com/author # (or some other link)
---

```

In the blog post, you should include a line `<!--truncate-->`. This determines under which point text will be ignored when generating the preview of your blog post. Blog posts should have the file name format: `yyyy-mm-dd-your-file-name.md`.

## Static Build

To create a static build of the website, run `yarn build` (in `website/`). The result will be put in `website/build/`.
