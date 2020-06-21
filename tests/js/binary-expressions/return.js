function foo() {
  return this.hasPlugin("dynamicImports") && this.lookahead().type === tt.parenLeft.right;
}

function foo() {
  return this.hasPlugin("dynamicImports") && this.lookahead().type === tt.parenLeft.right
    ? true
    : false;
}

function foo() {
  return this.calculate().compute().first.numberOfThings > this.calculate().compute().last.numberOfThings
    ? true
    : false;
}
