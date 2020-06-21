/* @flow */

import { SUCCESS, ERROR } from './constants'

type Success = {
  type: typeof SUCCESS,
  message: string
}

type Error = {
  type: typeof ERROR,
  error: string
}

function handleStatus(status: Success | Error) {
  switch(status.type) {
    case SUCCESS:
      console.log(`Successful: ${status.message}`);
      break;
    default:
      console.log(`Errored: ${status.error}`);
  }
}
