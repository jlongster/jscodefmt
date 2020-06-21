---
id: version-stable-technical-details
title: Technical Details
original_id: technical-details
---

This printer is a fork of [recast](https://github.com/benjamn/recast)'s printer with its algorithm replaced by the one described by Wadler in "[A prettier printer](https://homepages.inf.ed.ac.uk/wadler/papers/prettier/prettier.pdf)". There still may be leftover code from recast that needs to be cleaned up.

The basic idea is that the printer takes an AST and returns an intermediate representation of the output, and the printer uses that to generate a string. The advantage is that the printer can "measure" the IR and see if the output is going to fit on a line, and break if not.

This means that most of the logic of printing an AST involves generating an abstract representation of the output involving certain commands. For example, `concat(["(", line, arg, line, ")"])` would represent a concatenation of opening parens, an argument, and closing parens. But if that doesn't fit on one line, the printer can break where `line` is specified.

More (rough) details can be found in [commands.md](https://github.com/prettier/prettier/blob/master/commands.md).
