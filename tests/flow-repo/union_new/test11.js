// @noflow

// disjoint unions

function length(list: List) {
  if (list.kind === "cons") return length(list.next) + 1;
  else return 0;
}


length({ kind: "nil" });
length({ kind: "cons" }); // missing `next`
length({ kind: "cons", next: { kind: "nil" } });
length({ kind: "empty" }); // `kind` not found

type List = Nil | Cons;
type Nil = { kind: "nil" };
type Cons = { kind: "cons", next: List };
