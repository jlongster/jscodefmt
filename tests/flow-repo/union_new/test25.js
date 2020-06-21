// @noflow

// termination test (see also lib/test25_lib.js)

function foo(rows: Rows, set: Set<number>) {
  return rows.reduce_rows(
    (set, row) => row.reduce_row(
      (set, i) => set.add(i),
      set,
    ),
    set,
  );
}
