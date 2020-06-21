/* @flow */

const a = new URLSearchParams("key1=value1"); // correct
const b = new URLSearchParams(['key1', 'value1']); // not correct
const c = new URLSearchParams({'key1': 'value1'}); // not correct
const d = new URLSearchParams(c); // correct
const e: URLSearchParams = new URLSearchParams(); // correct
e.append('key1', 'value1'); // correct
e.append('key1'); // not correct
e.append({'key1': 'value1'}); // not correct
e.set('key1', 'value1'); // correct
e.set('key1'); // not correct
e.set({'key1': 'value1'}); // not correct

const f: URLSearchParams = e.append('key1', 'value1'); // not correct

const g: string = e.get('key1'); // correct
const h: number = e.get('key1'); // not correct

for (let v of e) {
  const [i, j]: [string, string] = v; // correct
}

for (let v of e.entries()) {
  const [i, j]: [string, string] = v; // correct
}

e.getAll('key1').forEach((v: string) => {}); // correct

e.forEach((val: string) => val); // correct
e.forEach((val: string, key: string) => `${key}: ${val}`); // correct
e.forEach((val: string, key: string, o: URLSearchParams) => {}); // correct
e.forEach(() => {}, {}); // correct
