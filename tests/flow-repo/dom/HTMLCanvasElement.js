// @flow

let tests = [
  // getContext
  function(el: HTMLCanvasElement) {
    (el.getContext('2d'): ?CanvasRenderingContext2D);
  }
];
