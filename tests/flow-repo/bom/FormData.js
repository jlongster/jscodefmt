/* @flow */

// constructor
const a: FormData = new FormData(); // correct
new FormData(''); // incorrect
new FormData(document.createElement('input')); // incorrect
new FormData(document.createElement('form')); // correct

// has
const b: boolean = a.has('foo'); // correct

// get
const c: ?(string | File) = a.get('foo'); // correct
const d: string = a.get('foo'); // incorrect
const e: Blob = a.get('foo'); // incorrect
const f: ?(string | File | Blob) = a.get('foo'); // incorrect
a.get(2); // incorrect

// getAll
const a1: Array<string | File> = a.getAll('foo'); // correct
const a2: Array<string | File | number> = a.getAll('foo'); // incorrect
const a3: Array<string | Blob | File> = a.getAll('foo'); // incorrect
a.getAll(23); // incorrect

// set
a.set('foo', 'bar'); // correct
a.set('foo', {}); // incorrect
a.set(2, 'bar'); // incorrect
a.set('foo', 'bar', 'baz'); // incorrect
a.set('bar', new File([], 'q')) // correct
a.set('bar', new File([], 'q'), 'x') // correct
a.set('bar', new File([], 'q'), 2) // incorrect
a.set('bar', new Blob) // correct
a.set('bar', new Blob, 'x') // correct
a.set('bar', new Blob, 2) // incorrect

// append
a.append('foo', 'bar'); // correct
a.append('foo', {}); // incorrect
a.append(2, 'bar'); // incorrect
a.append('foo', 'bar', 'baz'); // incorrect
a.append('foo', 'bar'); // correct
a.append('bar', new File([], 'q')) // correct
a.append('bar', new File([], 'q'), 'x') // correct
a.append('bar', new File([], 'q'), 2) // incorrect
a.append('bar', new Blob) // correct
a.append('bar', new Blob, 'x') // correct
a.append('bar', new Blob, 2) // incorrect

// delete
a.delete('xx'); // correct
a.delete(3); // incorrect

// keys
for (let x: string of a.keys()) {} // correct
for (let x: number of a.keys()) {} // incorrect

// values
for (let x: string | File of a.values()) {} // correct
for (let x: string | File | Blob of a.values()) {} // incorrect

// entries
for (let [x, y]: [string, string | File] of a.entries()) {} // correct
for (let [x, y]: [string, string | File | Blob] of a.entries()) {} // incorrect
for (let [x, y]: [number, string] of a.entries()) {} // incorrect
for (let [x, y]: [string, number] of a.entries()) {} // incorrect
for (let [x, y]: [number, number] of a.entries()) {} // incorrect
