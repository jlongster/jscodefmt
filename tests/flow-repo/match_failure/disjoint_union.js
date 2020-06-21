/* @flow */

type Shape =
  {type: 'rectangle', width: number, height: number} |
  {type: 'circle', radius: number};

function area(shape: Shape): number {
  if (shape.type === 'square') { // TODO: this should be an error
    return shape.width * shape.height;
  } else if (shape.type === 'circle') {
    return Math.PI * Math.pow(shape.radius, 2);
  }
  throw "unreachable"; // TODO: this shouldn't be needed
}
