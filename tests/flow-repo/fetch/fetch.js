/* @flow */

// most of the details are tested in the separate file
// here I test the basic usage

const myRequest = new Request('http://google.com');

const a: Promise<string> =
  fetch(myRequest)
  .then(response => response.text());

const b: Promise<string> = fetch(myRequest); // incorrect

var myInit = { method: 'GET',
               headers: {
                   'Content-Type': 'image/jpeg'
               },
               mode: 'cors',
               cache: 'default' };

const c: Promise<Blob> =
  fetch('image.png')
  .then(response => response.blob()); // correct

const d: Promise<Blob> = fetch('image.png'); // incorrect
