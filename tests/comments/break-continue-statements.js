for (;;) {
  break /* comment */;
  continue /* comment */;
}

loop: for (;;) {
  break /* comment */ loop;
  break loop /* comment */;
  continue /* comment */ loop;
  continue loop /* comment */;
}

// https://github.com/prettier/prettier/issues/7126
for (;;) {
  if (condition) continue

  // breaking comment
  ;(possibleArray || []).sort()
}

lbl: for (;;) {
  if (condition) continue lbl

  // breaking comment
  ;(possibleArray || []).sort()
}
