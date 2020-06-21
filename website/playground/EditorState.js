import * as React from "react";

import { stateToggler, shallowEqual } from "./helpers";
import * as storage from "./storage";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      showSidebar: false,
      showAst: false,
      showDoc: false,
      showSecondFormat: false,
      toggleSidebar: () => this.setState(stateToggler("showSidebar")),
      toggleAst: () => this.setState(stateToggler("showAst")),
      toggleDoc: () => this.setState(stateToggler("showDoc")),
      toggleSecondFormat: () => this.setState(stateToggler("showSecondFormat")),
      ...storage.get("editor_state"),
    };
  }

  componentDidUpdate(_, prevState) {
    if (!shallowEqual(this.state, prevState)) {
      storage.set("editor_state", this.state);
    }
  }

  render() {
    return this.props.children(this.state);
  }
}
