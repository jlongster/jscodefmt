var { ColorId, ColorNumber } = require('./test');
var ColorIdToNumber = {
  [ColorId.RED]: ColorNumber.RED,
  [ColorId.GREEN]: ColorNumber.GREEN,
  [ColorId.BLUE]: ColorNumber.BLUE,
};

(ColorIdToNumber[ColorId.GREEN]: 'ffffff'); // oops

module.exports = ColorIdToNumber;
