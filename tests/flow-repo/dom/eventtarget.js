// @flow

let listener: EventListener = function (event: Event) :void {};

let tests = [
  // attachEvent
  function() {
    let target = new EventTarget();
    (target.attachEvent('foo', listener): void); // invalid, may be undefined
    (target.attachEvent && target.attachEvent('foo', listener): void); // valid
  },

  // detachEvent
  function() {
    let target = new EventTarget();
    (target.detachEvent('foo', listener): void); // invalid, may be undefined
    (target.detachEvent && target.detachEvent('foo', listener): void); // valid
  },

  function() {
    window.onmessage = (event: MessageEvent) => {
      (event.target: window);
    };
  },
];
