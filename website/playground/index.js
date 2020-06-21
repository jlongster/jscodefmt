import "codemirror-graphql/mode";

import * as React from "react";
import * as ReactDOM from "react-dom";

import Playground from "./Playground";
import VersionLink from "./VersionLink";
import WorkerApi from "./WorkerApi";
import { fixPrettierVersion } from "./util";

class App extends React.Component {
  constructor() {
    super();
    this.state = { loaded: false };
    this.worker = new WorkerApi("/worker.js");
  }

  componentDidMount() {
    this.worker.getMetadata().then(({ supportInfo, version }) => {
      this.setState({
        loaded: true,
        availableOptions: supportInfo.options.map(augmentOption),
        version: fixPrettierVersion(version),
      });
    });
  }

  render() {
    const { loaded, availableOptions, version } = this.state;

    if (!loaded) {
      return "Loading...";
    }

    return (
      <React.Fragment>
        <VersionLink version={version} />
        <Playground
          worker={this.worker}
          availableOptions={availableOptions}
          version={version}
        />
      </React.Fragment>
    );
  }
}

function augmentOption(option) {
  if (option.type === "boolean" && option.default === true) {
    option.inverted = true;
  }

  option.cliName =
    "--" +
    (option.inverted ? "no-" : "") +
    option.name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

  return option;
}

ReactDOM.render(<App />, document.getElementById("root"));
