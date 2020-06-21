// @flow

// Sanity check:
// - preserving `havoc` semantics

type Meeting = {
  organizer: ?Invitee,
  es: Array<Invitee>
}

type Invitee = {
  fbid: number
}

function f(_this: { m: ?Meeting }): string {
  if (!_this.m) {
    return "0";
  }

  if (_this.m.es.some((a) => a.fbid === 0)) {

  }
  return "3";
}
