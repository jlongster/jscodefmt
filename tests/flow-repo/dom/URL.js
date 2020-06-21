/* @flow */

const a = new URL('http://flowtype.org/'); // correct
const b = new URL('/docs', a); // correct
const c = new URL('/docs', 'http://flowtype.org/'); // correct

const d: URLSearchParams = c.searchParams; // correct
const e: string = c.path; // not correct
const f: string = c.pathname; // correct
const g: string = c.hash; // correct
const h: string = c.host; // correct
const i: string = c.hostname; // correct
const j: string = c.href; // correct
const l: string = c.origin; // correct
const m: string = c.password; // correct
const n: string = c.pathname; // correct
const o: string = c.port; // correct
const p: string = c.protocol; // correct
const q: string = c.search; // correct
const r: string = c.username; // correct
