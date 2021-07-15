---
id: option-philosophy
title: Option Philosophy
---

> Prettier has a few options because of history. **But we won’t add more of them.**
>
> Read on to learn more.

Prettier is not a kitchen-sink code formatter that attempts to print your code in any way you wish. It is _opinionated._ Quoting the [Why Prettier?](why-prettier.md) page:

> By far the biggest reason for adopting Prettier is to stop all the ongoing debates over styles.

Yet the more options Prettier has, the further from the above goal it gets. **The debates over styles just turn into debates over which Prettier options to use.** Formatting wars break out with renewed vigour: “Which option values are better? Why? Did we make the right choices?”

And it’s not the only cost options have. To learn more about their downsides, see the [issue about resisting adding configuration](https://github.com/prettier/prettier/issues/40), which has more 👍s than any option request issue.

So why are there any options at all?

- A few were added during Prettier’s infancy to make it take off at all. 🚀
- A couple were added after “great demand.” 🤔
- Some were added for compatibility reasons. 👍

Options that are easier to motivate include:

- `--trailing-comma es5` lets you use trailing commas in most environments without having to transpile (trailing function commas were added in ES2017).
- `--prose-wrap` is important to support all quirky Markdown renderers in the wild.
- `--html-whitespace-sensitivity` is needed due to the unfortunate whitespace rules of HTML.
- `--end-of-line` makes it easier for teams to keep CRLFs out of their git repositories.
- `--quote-props` is important for advanced usage of the Google Closure Compiler.

But other options are harder to motivate in hindsight: `--arrow-parens`, `--jsx-single-quote`, `--bracket-same-line` and `--no-bracket-spacing` are not the type of options we’re happy to have. They cause a lot of [bike-shedding](https://en.wikipedia.org/wiki/Law_of_triviality) in teams, and we’re sorry for that. Difficult to remove now, these options exist as a historical artifact and should not motivate adding more options (“If _those_ options exist, why can’t this one?”).

For a long time, we left option requests open in order to let discussions play out and collect feedback. What we’ve learned during those years is that it’s really hard to measure demand. Prettier has grown a lot in usage. What was “great demand” back in the day is not as much today. GitHub reactions and Twitter polls became unrepresentative. What about all silent users? It looked easy to add “just one more” option. But where should we have stopped? When is one too many? Even after adding “that one final option”, there would always be a “top issue” in the issue tracker.

However, the time to stop has come. Now that Prettier is mature enough and we see it adopted by so many organizations and projects, the research phase is over. We have enough confidence to conclude that Prettier reached a point where the set of options should be “frozen”. **Option requests aren’t accepted anymore.** We’re thankful to everyone who participated in this difficult journey.

Please note that as option requests are out of scope for Prettier, they will be closed without discussion. The same applies to requests to preserve elements of input formatting (e.g. line breaks) since that’s nothing else but an option in disguise with all the downsides of “real” options. There may be situations where adding an option can’t be avoided because of technical necessity (e.g. compatibility), but for formatting-related options, this is final.
