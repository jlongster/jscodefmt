var ColorId = {
  RED: 'R',
  GREEN: 'G',
  BLUE: 'B',
};

var ColorNumber = {
  RED: 'ff0000',
  GREEN: '00ff00',
  BLUE: '0000ff',
};

var ColorIdToNumber = {
  [ColorId.RED]: ColorNumber.RED,
  [ColorId.GREEN]: ColorNumber.GREEN,
  [ColorId.BLUE]: ColorNumber.BLUE,
};

(ColorIdToNumber[ColorId.RED]: 'ffffff'); // oops

ColorIdToNumber.XXX; // oops

module.exports = { ColorId, ColorNumber };
