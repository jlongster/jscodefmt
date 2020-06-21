/* @flow */

const crypto = require('crypto');

let tests = [
  // Hmac is a duplex stream
  function() {
    const hmac = crypto.createHmac('sha256', 'a secret');

    hmac.on('readable', () => {
      (hmac.read(): ?(string | Buffer));
      (hmac.read(): number); // 4 errors: null, void, string, Buffer
    });

    hmac.write('some data to hash');
    hmac.write(123); // 2 errors: not a string or a Buffer
    hmac.end();
  },

  // Hmac supports update and digest functions too
  function(buf: Buffer) {
    const hmac = crypto.createHmac('sha256', 'a secret');

    hmac.update('some data to hash');
    hmac.update('foo', 'utf8');
    hmac.update('foo', 'bogus'); // 1 error
    hmac.update(buf);
    hmac.update(buf, 'utf8'); // 1 error: no encoding when passing a buffer

    // it's also chainable
    (hmac.update('some data to hash').update(buf).digest(): Buffer);

    (hmac.digest('hex'): string);
    (hmac.digest(): Buffer);
    (hmac.digest('hex'): void); // 1 error
    (hmac.digest(): void); // 1 error
  }
]
