/* @flow */

function optionalNullable1(x: {y?: ?number}) {
  if (x.y !== null && x.y !== undefined) {
    x.y++;
  }
}

function optionalNullable2(x: {y?: ?number}) {
  if (x.y !== undefined && x.y !== null) {
    x.y++;
  }
}

function optionalNullable3(x: {y?: ?number}) {
  if (!(x.y !== null && x.y !== undefined)) {
    x.y++; // should error
  }
}

function optionalNullable4(x: {y?: ?number}) {
  if (!(x.y !== undefined && x.y !== null)) {
    x.y++; // should error
  }
}

function optionalNullable5(x: {y?: ?number}) {
  if (x.y === null || x.y === undefined) {
    x.y++; // should error
  }
}

function optionalNullable6(x: {y?: ?number}) {
  if (x.y === undefined || x.y === null) {
    x.y++; // should error
  }
}

function optionalNullable7(x: {y?: ?number}) {
  if (!(x.y === null || x.y === undefined)) {
    x.y++;
  }
}

function optionalNullable8(x: {y?: ?number}) {
  if (!(x.y === undefined || x.y === null)) {
    x.y++;
  }
}
