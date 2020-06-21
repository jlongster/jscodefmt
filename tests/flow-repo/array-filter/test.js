/* @flow */

function filterOutVoids<T> (arr: Array<?T>): Array<T> {
  return arr.filter(Boolean)
}

function filterOutSmall (arr: Array<?number>): Array<?number> {
  return arr.filter(num => num && num > 10)
}
