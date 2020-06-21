const formData = #{ title: "Implement all the things" }
const taskNow = #{ id: 42, status: "WIP", ...formData }
const taskLater = #{ ...taskNow, status: "DONE" }

// A reminder: The ordering of keys in record literals does not affect equality (and is not retained)
assert(taskLater === #{ status: "DONE", title: formData.title, id: 42 })
