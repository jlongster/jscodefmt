// Error
const a = (data/*: Object */) => {}

// OK
const b = (data/*: Object */, secondData/*: Object */) => {}

const c = (data/*: /* this is an object *-/ Object */) => {};

const run = (cmd /*: string */) /*: Promise<void> */ => {}
