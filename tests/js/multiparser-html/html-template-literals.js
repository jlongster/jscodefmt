const nestedFun = /* HTML */ `${outerExpr(1)}
  <script>
    const tpl = html\`<div>\${innerExpr(1)} ${outerExpr(2)}</div>\`;
  </script>`;

const nestedFun2 = /* HTML */ `${outerExpr(1)}
  <script>
    const tpl = html\`\\n<div>\${innerExpr(1)} ${outerExpr(2)}</div>\\n\`;
  </script>`;

setFoo(
  html`<div>one</div>
    <div>two</div>
    <div>three</div>`,
  secondArgument
);

setFoo(
  html`<div>
      <div>nested</div>
    </div>
    <div>two</div>
    <div>three</div>`,
  secondArgument
);

setFoo(
  html`<div>
    <div>nested</div>
  </div>`,
  secondArgument
);
