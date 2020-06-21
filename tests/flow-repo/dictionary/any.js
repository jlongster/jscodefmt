/* @flow */

const dict: {[key: string]: number} = {}
const k: any = 'foo'
const val: string = dict[k] // error: number incompatible with string
