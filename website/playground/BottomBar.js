import * as React from "react";
import * as ReactDOM from "react-dom";

const root = document.getElementById("bottom-bar");

export default function ({ left, right }) {
  return ReactDOM.createPortal(
    <React.Fragment>
      <div className="bottom-bar-buttons">{left}</div>
      <div className="bottom-bar-buttons bottom-bar-buttons-right">{right}</div>
    </React.Fragment>,
    root
  );
}
