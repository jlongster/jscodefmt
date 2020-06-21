// @flow

let tests = [
  // fillRect
  function(ctx: CanvasRenderingContext2D) {
    ctx.fillRect(0, 0, 200, 100);
  },

  // moveTo
  function(ctx: CanvasRenderingContext2D) {
    ctx.moveTo('0', '1');  // error: should be numbers
  },
];
