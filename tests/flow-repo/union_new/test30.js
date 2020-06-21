// @noflow

const Constants = require('./test30-helper');

type ActionType =
  | { type: 'foo', x: number }
  | { type: 'bar', x: number }

({ type: Constants.BAR, x: 0 }: ActionType);
