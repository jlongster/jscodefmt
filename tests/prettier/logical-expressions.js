function a() {
  switch(1) {
    case "Literal":
      return parent.type === "MemberExpression"
        && isNumber.check(node.value)
        && name === "object"
        && parent.object === node;
  }
}

function b() {
  if (isTrue() || isFalse()) {
    return this;
  }
}

function c() {
  if (isTrue() || isFalse() || isFoo() || isBar() || isBaz() || isFooBarBaz() || howLongDoesThisHaveToBe()) {
    return this;
  }
}

function d() {
  switch(1) {
    case "Literal":
      return parent.type === "MemberExpression"
        && isNumber.check(node.value)
        && name === "object"
        && (
          nestedOne || nestedTwo || nestedThree || nestedFour || nestedFive || nestedSix || nestedSeven || nestedEight
        );
  }
}

function e() {
  return (
    true &&
    true &&
    (false || true)
  );
}

function f() {
  return (one() && two() || three() && four() && five());
}
