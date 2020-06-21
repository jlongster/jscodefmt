// @flow

let tests = [
  // CustomEvent
  function(document: Document) {
    const event = document.createEvent('CustomEvent');
    event.initCustomEvent('butts', true, false, { nice: 42 });
  }
];
