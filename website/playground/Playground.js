import * as React from "react";

import { Button, ClipboardButton } from "./buttons";
import EditorState from "./EditorState";
import { DebugPanel, InputPanel, OutputPanel } from "./panels";
import PrettierFormat from "./PrettierFormat";
import { shallowEqual } from "./helpers";
import * as urlHash from "./urlHash";
import formatMarkdown from "./markdown";
import * as util from "./util";
import getCodeSample from "./codeSamples";

import { Sidebar, SidebarCategory } from "./sidebar/components";
import SidebarOptions from "./sidebar/SidebarOptions";
import Option from "./sidebar/options";
import { Checkbox } from "./sidebar/inputs";

const CATEGORIES_ORDER = [
  "Global",
  "Common",
  "JavaScript",
  "Markdown",
  "HTML",
  "Special",
];
const ENABLED_OPTIONS = [
  "parser",
  "printWidth",
  "tabWidth",
  "useTabs",
  "semi",
  "singleQuote",
  "bracketSpacing",
  "jsxSingleQuote",
  "jsxBracketSameLine",
  "quoteProps",
  "arrowParens",
  "trailingComma",
  "proseWrap",
  "htmlWhitespaceSensitivity",
  "insertPragma",
  "requirePragma",
  "vueIndentScriptAndStyle",
  "embeddedLanguageFormatting",
];
const ISSUES_URL = "https://github.com/prettier/prettier/issues/new?body=";
const MAX_LENGTH = 8000 - ISSUES_URL.length; // it seems that GitHub limit is 8195
const COPY_MESSAGE =
  "<!-- The issue body has been saved to the clipboard. Please paste it after this line! 👇 -->\n";

class Playground extends React.Component {
  constructor(props) {
    super();

    const original = urlHash.read();

    const defaultOptions = util.getDefaults(
      props.availableOptions,
      ENABLED_OPTIONS
    );

    const options = Object.assign(defaultOptions, original.options);

    // backwards support for old parser `babylon`
    if (options.parser === "babylon") {
      options.parser = "babel";
    }

    const content = original.content || getCodeSample(options.parser);
    const selection = {};

    this.state = { content, options, selection };

    this.handleOptionValueChange = this.handleOptionValueChange.bind(this);

    this.setContent = (content) => this.setState({ content });
    this.clearContent = this.setContent.bind(this, "");
    this.resetOptions = () => this.setState({ options: defaultOptions });
    this.setSelection = (selection) => this.setState({ selection });
    this.setSelectionAsRange = () => {
      const { selection, content, options } = this.state;
      const [rangeStart, rangeEnd] = util.convertSelectionToRange(
        selection,
        content
      );
      const updatedOptions = { ...options, rangeStart, rangeEnd };
      if (rangeStart === rangeEnd) {
        delete updatedOptions.rangeStart;
        delete updatedOptions.rangeEnd;
      }
      this.setState({ options: updatedOptions });
    };

    this.enabledOptions = orderOptions(props.availableOptions, ENABLED_OPTIONS);
    this.rangeStartOption = props.availableOptions.find(
      (opt) => opt.name === "rangeStart"
    );
    this.rangeEndOption = props.availableOptions.find(
      (opt) => opt.name === "rangeEnd"
    );

    this.handleInputPanelFormat = this.handleInputPanelFormat.bind(this);
  }

  componentDidUpdate(_, prevState) {
    const { content, options } = this.state;
    if (
      !shallowEqual(prevState.options, this.state.options) ||
      prevState.content !== content
    ) {
      urlHash.replace({ content, options });
    }
  }

  handleOptionValueChange(option, value) {
    this.setState((state) => {
      const options = { ...state.options };

      if (option.type === "int" && Number.isNaN(value)) {
        delete options[option.name];
      } else {
        options[option.name] = value;
      }

      const content =
        state.content === "" ||
        state.content === getCodeSample(state.options.parser)
          ? getCodeSample(options.parser)
          : state.content;

      return { options, content };
    });
  }

  getMarkdown({ formatted, reformatted, full, doc }) {
    const { content, options } = this.state;
    const { availableOptions, version } = this.props;
    const orderedOptions = orderOptions(availableOptions, [
      ...ENABLED_OPTIONS,
      "rangeStart",
      "rangeEnd",
    ]);
    const cliOptions = util.buildCliArgs(orderedOptions, options);

    return formatMarkdown({
      input: content,
      output: formatted,
      output2: reformatted,
      doc,
      version,
      url: window.location.href,
      options,
      cliOptions,
      full,
    });
  }

  handleInputPanelFormat() {
    if (this.state.options.parser !== "doc-explorer") {
      return;
    }

    const { content, selection } = this.state;

    return this.props.worker
      .format(content, {
        parser: "__js_expression",
        cursorOffset: util.convertSelectionToRange(selection, content)[0],
      })
      .then(({ error, formatted, cursorOffset }) => {
        if (error) {
          return;
        }

        return {
          value: formatted,
          cursor: util.convertOffsetToPosition(cursorOffset, formatted),
        };
      });
  }

  render() {
    const { worker, version } = this.props;
    const { content, options } = this.state;

    // TODO: remove this when v2.3.0 is released
    const [major, minor] = version.split(".", 2).map(Number);
    const showShowComments =
      Number.isNaN(major) || (major === 2 && minor >= 3) || major > 2;

    return (
      <EditorState>
        {(editorState) => (
          <PrettierFormat
            worker={worker}
            code={content}
            options={options}
            debugAst={editorState.showAst}
            debugDoc={editorState.showDoc}
            debugComments={showShowComments && editorState.showComments}
            reformat={editorState.showSecondFormat}
          >
            {({ formatted, debug }) => {
              const fullReport = this.getMarkdown({
                formatted,
                reformatted: debug.reformatted,
                full: true,
              });
              const showFullReport =
                encodeURIComponent(fullReport).length < MAX_LENGTH;
              return (
                <React.Fragment>
                  <div className="editors-container">
                    <Sidebar visible={editorState.showSidebar}>
                      <SidebarOptions
                        categories={CATEGORIES_ORDER}
                        availableOptions={this.enabledOptions}
                        optionValues={options}
                        onOptionValueChange={this.handleOptionValueChange}
                      />
                      <SidebarCategory title="Range">
                        <label>
                          The selected range will be highlighted in yellow in
                          the input editor
                        </label>
                        <Option
                          option={this.rangeStartOption}
                          value={
                            typeof options.rangeStart === "number"
                              ? options.rangeStart
                              : ""
                          }
                          onChange={this.handleOptionValueChange}
                        />
                        <Option
                          option={this.rangeEndOption}
                          value={
                            typeof options.rangeEnd === "number"
                              ? options.rangeEnd
                              : ""
                          }
                          overrideMax={content.length}
                          onChange={this.handleOptionValueChange}
                        />

                        <Button onClick={this.setSelectionAsRange}>
                          Set selected text as range
                        </Button>
                      </SidebarCategory>
                      <SidebarCategory title="Debug">
                        <Checkbox
                          label="show input"
                          checked={editorState.showInput}
                          onChange={editorState.toggleInput}
                        />
                        <Checkbox
                          label="show AST"
                          checked={editorState.showAst}
                          onChange={editorState.toggleAst}
                        />
                        <Checkbox
                          label="show doc"
                          checked={editorState.showDoc}
                          onChange={editorState.toggleDoc}
                        />
                        {showShowComments && (
                          <Checkbox
                            label="show comments"
                            checked={editorState.showComments}
                            onChange={editorState.toggleComments}
                          />
                        )}
                        <Checkbox
                          label="show output"
                          checked={editorState.showOutput}
                          onChange={editorState.toggleOutput}
                        />
                        <Checkbox
                          label="show second format"
                          checked={editorState.showSecondFormat}
                          onChange={editorState.toggleSecondFormat}
                        />
                        {editorState.showDoc && (
                          <ClipboardButton
                            copy={() => this.getMarkdown({ doc: debug.doc })}
                            disabled={!debug.doc}
                          >
                            Copy doc
                          </ClipboardButton>
                        )}
                      </SidebarCategory>
                      <div className="sub-options">
                        <Button onClick={this.resetOptions}>
                          Reset to defaults
                        </Button>
                      </div>
                    </Sidebar>
                    <div className="editors">
                      {editorState.showInput ? (
                        <InputPanel
                          mode={util.getCodemirrorMode(options.parser)}
                          ruler={options.printWidth}
                          value={content}
                          codeSample={getCodeSample(options.parser)}
                          overlayStart={options.rangeStart}
                          overlayEnd={options.rangeEnd}
                          onChange={this.setContent}
                          onSelectionChange={this.setSelection}
                          onFormat={this.handleInputPanelFormat}
                        />
                      ) : null}
                      {editorState.showAst ? (
                        <DebugPanel
                          value={debug.ast || ""}
                          autoFold={util.getAstAutoFold(options.parser)}
                        />
                      ) : null}
                      {editorState.showDoc ? (
                        <DebugPanel value={debug.doc || ""} />
                      ) : null}
                      {showShowComments && editorState.showComments ? (
                        <DebugPanel
                          value={debug.comments || ""}
                          autoFold={util.getAstAutoFold(options.parser)}
                        />
                      ) : null}
                      {editorState.showOutput ? (
                        <OutputPanel
                          mode={util.getCodemirrorMode(options.parser)}
                          value={formatted}
                          ruler={options.printWidth}
                        />
                      ) : null}
                      {editorState.showSecondFormat ? (
                        <OutputPanel
                          mode={util.getCodemirrorMode(options.parser)}
                          value={getSecondFormat(formatted, debug.reformatted)}
                          ruler={options.printWidth}
                        />
                      ) : null}
                    </div>
                  </div>
                  <div className="bottom-bar">
                    <div className="bottom-bar-buttons">
                      <Button onClick={editorState.toggleSidebar}>
                        {editorState.showSidebar ? "Hide" : "Show"} options
                      </Button>
                      <Button onClick={this.clearContent}>Clear</Button>
                      <ClipboardButton
                        copy={JSON.stringify(
                          // Remove `parser` since people usually paste this
                          // into their .prettierrc and specifying a top-level
                          // parser there is an anti-pattern. Note:
                          // `JSON.stringify` omits keys whose values are
                          // `undefined`.
                          { ...options, parser: undefined },
                          null,
                          2
                        )}
                      >
                        Copy config JSON
                      </ClipboardButton>
                    </div>
                    <div className="bottom-bar-buttons bottom-bar-buttons-right">
                      <ClipboardButton copy={window.location.href}>
                        Copy link
                      </ClipboardButton>
                      <ClipboardButton
                        copy={() =>
                          this.getMarkdown({
                            formatted,
                            reformatted: debug.reformatted,
                          })
                        }
                      >
                        Copy markdown
                      </ClipboardButton>
                      <a
                        href={getReportLink(
                          showFullReport ? fullReport : COPY_MESSAGE
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ClipboardButton
                          copy={() => (showFullReport ? "" : fullReport)}
                        >
                          Report issue
                        </ClipboardButton>
                      </a>
                    </div>
                  </div>
                </React.Fragment>
              );
            }}
          </PrettierFormat>
        )}
      </EditorState>
    );
  }
}

function orderOptions(availableOptions, order) {
  const optionsByName = {};
  for (const option of availableOptions) {
    optionsByName[option.name] = option;
  }

  return order.map((name) => optionsByName[name]);
}

function getReportLink(reportBody) {
  return `${ISSUES_URL}${encodeURIComponent(reportBody)}`;
}

function getSecondFormat(formatted, reformatted) {
  return formatted === ""
    ? ""
    : formatted === reformatted
    ? "✓ Second format is unchanged."
    : reformatted;
}

export default Playground;
