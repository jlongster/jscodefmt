// @flow

(Promise.resolve(): Promise<number>); // error

(Promise.resolve(undefined): Promise<number>); // error
