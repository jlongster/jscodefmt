new (window.Request/*: Class<Request> */)("");

(this/*: any */).foo = 5;

(this/*    : any */).foo = 5;

// This next example illustrates that Prettier will not remove a line break
// and unintentionally create a type annotation that was not there before.
(this/*
: any */).foo = 5;

const x = (input /*: string */) /*: string */ => {};
