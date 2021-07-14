---
id: technical-details
title: Technical Details
---

This printer is a fork of [recast](https://github.com/benjamn/recast)’s printer with its algorithm replaced by the one described by Wadler in "[A prettier printer](https://homepages.inf.ed.ac.uk/wadler/papers/prettier/prettier.pdf)". There still may be leftover code from recast that needs to be cleaned up.

The basic idea is that the printer takes an AST and returns an intermediate representation of the output, and the printer uses that to generate a string. The advantage is that the printer can "measure" the IR and see if the output is going to fit on a line, and break if not.

This means that most of the logic of printing an AST involves generating an abstract representation of the output involving certain commands. For example, `["(", line, arg, line, ")"]` would represent a concatenation of opening parens, an argument, and closing parens. But if that doesn’t fit on one line, the printer can break where `line` is specified.

The [Playground](https://prettier.io/playground) has a special mode for exploring how Prettier’s intermediate representation is printed. To get there, open the sidebar (the "Show options" button) and set the `parser` option to the special value `doc-explorer`.

More (rough) details can be found in [commands.md](https://github.com/prettier/prettier/blob/main/commands.md).
