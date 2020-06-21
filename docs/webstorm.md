---
id: webstorm
title: WebStorm Setup
---

## Using Prettier in WebStorm

Use the `Reformat with Prettier` action (`Opt-Shift-Cmd-P` on macOS or `Alt-Shift-Ctrl-P` on Windows and Linux) to format the selected code, a file, or a whole directory.

To run Prettier on save in WebStorm 2020.1 or above, open _Preferences | Languages & Frameworks | JavaScript | Prettier_ and enable the option `Run on save for files`.

By default, only JavaScript and TypeScript files will be formatted automatically. You can further configure what files will be updated using the [glob pattern](https://github.com/isaacs/node-glob#glob-primer).

Don't forget to install Prettier first.

To use Prettier in IntelliJ IDEA, PhpStorm, PyCharm, and other JetBrains IDEs, please install this [plugin](https://plugins.jetbrains.com/plugin/10456-prettier).

To run Prettier on save in older IDE versions, you can set up a file watcher following the instructions below.

## Running Prettier on save using File Watcher

To automatically format your files using Prettier on save in WebStorm 2019.\* or earlier, you can use a [File Watcher](https://plugins.jetbrains.com/plugin/7177-file-watchers).

Go to _Preferences | Tools | File Watchers_ and click **+** to add a new watcher.

In Webstorm 2018.2, select Prettier from the list, review the configuration, add any additional arguments if needed, and click OK.

In older IDE versions, select Custom and do the following configuration:

- **Name**: _Prettier_ or any other name
- **File Type**: _JavaScript_ (or _Any_ if you want to run Prettier on all files)
- **Scope**: _Project Files_
- **Program**: full path to `.bin/prettier` or `.bin\prettier.cmd` in the project's `node_module` folder. Or, if Prettier is installed globally, select `prettier` on macOS and Linux or `C:\Users\user_name\AppData\Roaming\npm\prettier.cmd` on Windows (or whatever `npm prefix -g` returns).
- **Arguments**: `--write [other options] $FilePath$`
- **Output paths to refresh**: `$FilePathRelativeToProjectRoot$`
- **Working directory**: `$ProjectFileDir$`
- **Environment variables**: add `COMPILE_PARTIAL=true` if you want to run Prettier on partials (like `_component.scss`)
- **Auto-save edited files to trigger the watcher**: Uncheck to reformat on Save only.

## Using Prettier with ESLint

If you are using ESLint with [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier), use the `Fix ESLint Problems` action to reformat the current file – find it using _Find Action_ (`Cmd/Ctrl-Shift-A`) or [add a keyboard shortcut](https://www.jetbrains.com/help/webstorm/configuring-keyboard-shortcuts.html) to it in _Preferences | Keymap_ and then use it.

Make sure that the ESLint integration is enabled in _Preferences | Languages & Frameworks | JavaScript | Code Quality Tools | ESLint_.

## Using Prettier as External Tool

Go to _Preferences | Tools | External Tools_ and click **+** to add a new tool. Let’s name it **Prettier**.

- **Program**: `prettier` on macOS and Linux or `C:\Users\user_name\AppData\Roaming\npm\prettier.cmd` on Windows (or whatever `npm prefix -g` returns), if Prettier is installed globally
- **Parameters**: `--write [other options] $FilePath$`
- **Working directory**: `$ProjectFileDir$`

> If Prettier is installed locally in your project, replace the path in **Program** with `$ProjectFileDir$/node_modules/.bin/prettier` on macOS and Linux or `$ProjectFileDir$\node_modules\.bin\prettier.cmd` on Windows.

![Example](/docs/assets/webstorm/external-tool-prettier.png)

Press `Cmd/Ctrl-Shift-A` (_Find Action_), search for _Prettier_, and then hit `Enter`.

It will run Prettier for the current file.

You can [add a keyboard shortcut](https://www.jetbrains.com/help/webstorm/configuring-keyboard-shortcuts.html) to run this External tool configuration in _Preferences | Keymap_.
