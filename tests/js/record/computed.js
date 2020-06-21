const key = "a";
assert(#{ [key]: 1 } === #{ a: 1 })
assert(#{ [key.toUpperCase()]: 1 } === #{ A: 1 })

assert(#{ [true]: 1 } === #{ true: 1 })
assert(#{ [true]: 1 } === #{ ["true"]: 1 })

assert(#{ [1 + 1]: "two" } === #{ 2: "two" })
assert(#{ [9 + 1]: "ten" } === #{ ["10"]: "ten" })
