promise.then(
  (result) => result,
  (err) => err
)

promise.then(
  (result) => { f(); return result },
  (err) => { f(); return err }
)

foo(a => b)
foo(a => { return b })
foo(c, a => b)
foo(c, a => b, d)
foo(a => b, d)
