// @flow

interface Ok {
  [key: string]: string;
}

interface Bad {
  [k1: string]: string;
  [k2: number]: number; // error: not supported (yet)
}
