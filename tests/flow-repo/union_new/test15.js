// @noflow

// functions as objects

function foo<X>(target: EventTarget) {
  target.addEventListener('click', (e) => {});
}

declare class EventTarget {
  addEventListener(type: 'foo', listener: KeyboardEventHandler): void;
  addEventListener(type: string, listener: EventHandler): void;
}

declare class Event { }
declare class KeyboardEvent { }

type EventHandler = (event: Event) => mixed
type KeyboardEventHandler = (event: KeyboardEvent) => mixed

// example where globals are not yet resolved

function bar(x: (() => void) | { x: number }) { }

bar(() => { });
