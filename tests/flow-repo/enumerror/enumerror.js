/** @flow */

function isActive(ad: {state: $Keys<{
    PAUSED: string;
    ACTIVE: string;
    DELETED: string;
}>}): boolean {
    return ad.state === 'ACTIVE';
};
isActive({state: 'PAUSE'});

var MyStates = {
    PAUSED: 'PAUSED',
    ACTIVE: 'ACTIVE',
    DELETED: 'DELETED',
};
function isActive2(ad: {state: $Keys<typeof MyStates>}): boolean {
    return ad.state === MyStates.ACTIVE;
};
isActive2({state: 'PAUSE'});

type Keys = $Keys<{ x: any, y: any }>;
type Union = "x" | "y"

function keys2union(s: Keys): Union { return s; } // ok
function union2keys(s: Union): Keys { return s; } // ok
