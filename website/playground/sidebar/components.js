import * as React from "react";

export function Sidebar({ visible, children }) {
  return (
    <div className={`options-container ${visible ? "open" : ""}`}>
      <div className="options">{children}</div>
    </div>
  );
}

export function SidebarCategory({ title, children }) {
  return (
    <details className="sub-options" open="true">
      <summary>{title}</summary>
      {children}
    </details>
  );
}
